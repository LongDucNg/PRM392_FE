import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { ProductsAPI } from '../../services/productsAPI';
import { useCartViewModel } from '../../viewmodels/useCartViewModel';

/**
 * Checkout Screen - Màn hình đặt hàng
 */
export default function CheckoutScreen() {
  const colorScheme = 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  
  // Get selected items from params
  const selectedItemIds = searchParams.selectedItems
    ? searchParams.selectedItems.split(',')
    : null;
  
  const {
    cartItems,
    createOrder,
    isLoading,
    isCreatingOrder,
    error,
    fetchCart
  } = useCartViewModel();

  const [productInfoMap, setProductInfoMap] = useState({});
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // Track loaded products to avoid duplicate API calls
  const loadedProductsRef = useRef(new Set());
  const lastLoadedItemsRef = useRef([]);
  
  // Phí ship cố định
  const SHIPPING_FEE = 20000;

  // Memoize selected cart items to prevent unnecessary re-renders
  const selectedCartItems = useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return [];
    }
    
    if (selectedItemIds && selectedItemIds.length > 0) {
      return cartItems.filter(item => selectedItemIds.includes(item._id));
    } else {
      // If no selected items, checkout all items
      return cartItems;
    }
  }, [cartItems, selectedItemIds]);

  // Load product info for selected items
  const loadProductInfo = useCallback(async (items) => {
    if (!items || items.length === 0) {
      console.log('loadProductInfo: No items to load');
      return;
    }
    
    const productIds = [...new Set(items.map(item => item.productId))];
    console.log('loadProductInfo: Product IDs to check:', productIds);
    
    // Only load products that we haven't loaded yet
    const productsToLoad = productIds.filter(id => !loadedProductsRef.current.has(id));
    console.log('loadProductInfo: Products to load:', productsToLoad);
    
    if (productsToLoad.length === 0) {
      console.log('loadProductInfo: All products already loaded');
      return; // All products already loaded
    }
    
    const newInfoMap = {};
    
    for (const productId of productsToLoad) {
      try {
        console.log('loadProductInfo: Loading product:', productId);
        const product = await ProductsAPI.getProductById(productId);
        newInfoMap[productId] = product;
        loadedProductsRef.current.add(productId); // Mark as loaded
      } catch (error) {
        console.error(`Error loading product ${productId}:`, error);
      }
    }
    
    // Only update if we have new products
    if (Object.keys(newInfoMap).length > 0) {
      console.log('loadProductInfo: Updating productInfoMap with:', Object.keys(newInfoMap));
      setProductInfoMap(prev => ({ ...prev, ...newInfoMap }));
    }
  }, []);

  // Load product info when selectedCartItems change
  useEffect(() => {
    if (selectedCartItems && selectedCartItems.length > 0) {
      // Check if items have actually changed
      const currentItemIds = selectedCartItems.map(item => item._id).sort();
      const lastItemIds = lastLoadedItemsRef.current.map(item => item._id).sort();
      
      if (JSON.stringify(currentItemIds) !== JSON.stringify(lastItemIds)) {
        lastLoadedItemsRef.current = selectedCartItems;
        loadProductInfo(selectedCartItems);
      }
    }
  }, [selectedCartItems]);

  // Handle checkout
  const handlePlaceOrder = async () => {
    // Validation
    if (!shippingPhone || !shippingAddress) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin địa chỉ và số điện thoại');
      return;
    }

    if (selectedCartItems.length === 0) {
      Alert.alert('Lỗi', 'Không có sản phẩm để đặt hàng');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Lấy IDs của các items đã chọn
      const selectedItemIds = selectedCartItems.map(item => item._id);
      
      const orderData = {
        shippingPhone,
        shippingAddress,
        paymentMethod,
        note: note || undefined,
        selectedItemIds: selectedItemIds.length > 0 ? selectedItemIds : undefined
      };
      
      const order = await createOrder(orderData);
      
      // Show success message
      Alert.alert(
        'Thành công',
        'Đặt hàng thành công!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to orders screen
              router.push('/(tabs)/orders');
            }
          }
        ]
      );
    } catch (err) {
      console.error('Lỗi đặt hàng:', err);
      Alert.alert(
        'Lỗi',
        error || 'Không thể đặt hàng. Vui lòng thử lại sau.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate subtotal (chưa bao gồm phí ship)
  const calculateSubtotal = () => {
    if (!selectedCartItems || selectedCartItems.length === 0) {
      return 0;
    }
    return selectedCartItems.reduce((total, item) => {
      return total + (item.totalPrice || 0);
    }, 0);
  };

  // Calculate total (bao gồm phí ship)
  const calculateTotal = () => {
    return calculateSubtotal() + SHIPPING_FEE;
  };

  // Render product item in checkout
  const renderProductItem = ({ item }) => {
    const productInfo = productInfoMap[item.productId];
    const productName = productInfo?.name || 'Sản phẩm';
    const productCode = productInfo?.code;

    return (
      <View style={styles.productItem}>
        <View style={styles.productIcon}>
          <Ionicons name="cube-outline" size={32} color={theme.primary} />
        </View>
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{productName}</Text>
          {productCode && (
            <Text style={styles.productCode}>Mã: {productCode}</Text>
          )}
          <View style={styles.productPriceRow}>
            <Text style={styles.productPrice}>
              {item.unitPrice?.toLocaleString('vi-VN') || '0'} VNĐ
            </Text>
            <Text style={styles.productQuantity}>
              x {item.quantity}
            </Text>
          </View>
        </View>
        <Text style={styles.productTotal}>
          {item.totalPrice?.toLocaleString('vi-VN') || '0'} VNĐ
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đặt hàng</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sản phẩm ({selectedCartItems?.length || 0})</Text>
            {selectedCartItems && selectedCartItems.length > 0 ? selectedCartItems.map((item) => {
              const productInfo = productInfoMap[item.productId];
              return (
                <View key={item._id || `item-${Math.random()}`} style={styles.productItem}>
                  <View style={styles.productIcon}>
                    <Ionicons name="cube-outline" size={32} color={theme.primary} />
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>
                      {productInfo?.name || 'Sản phẩm'}
                    </Text>
                    {productInfo?.code && (
                      <Text style={styles.productCode}>
                        Mã: {productInfo.code}
                      </Text>
                    )}
                    <View style={styles.productPriceRow}>
                      <Text style={styles.productPrice}>
                        {item.unitPrice?.toLocaleString('vi-VN') || '0'} VNĐ
                      </Text>
                      <Text style={styles.productQuantity}>
                        x {item.quantity}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.productTotal}>
                    {item.totalPrice?.toLocaleString('vi-VN') || '0'} VNĐ
                  </Text>
                </View>
              );
            }) : (
              <View style={styles.emptyProductsContainer}>
                <Text style={styles.emptyProductsText}>Không có sản phẩm để đặt hàng</Text>
              </View>
            )}
          </View>

          {/* Shipping Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
            
            {/* Hiển thị địa chỉ có sẵn hoặc nút thêm địa chỉ */}
            {!showAddressForm && !shippingAddress ? (
              <View style={styles.addressCard}>
                <View style={styles.addressCardContent}>
                  <Ionicons name="location-outline" size={24} color={theme.primary} />
                  <View style={styles.addressCardText}>
                    <Text style={styles.addressCardTitle}>Chưa có địa chỉ giao hàng</Text>
                    <Text style={styles.addressCardSubtitle}>Nhấn để thêm địa chỉ mới</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.addAddressButton}
                  onPress={() => setShowAddressForm(true)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {shippingAddress && !showAddressForm && (
                  <View style={styles.savedAddressCard}>
                    <View style={styles.savedAddressContent}>
                      <Ionicons name="location" size={20} color={theme.primary} />
                      <View style={styles.savedAddressText}>
                        <Text style={styles.savedAddressTitle}>Địa chỉ giao hàng</Text>
                        <Text style={styles.savedAddressValue}>{shippingAddress}</Text>
                        <Text style={styles.savedAddressPhone}>{shippingPhone}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.editAddressButton}
                      onPress={() => setShowAddressForm(true)}
                    >
                      <Ionicons name="create-outline" size={18} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                )}
                
                {showAddressForm && (
                  <View style={styles.addressForm}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Số điện thoại *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Nhập số điện thoại"
                        value={shippingPhone}
                        onChangeText={setShippingPhone}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Địa chỉ giao hàng *</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Nhập địa chỉ giao hàng chi tiết"
                        value={shippingAddress}
                        onChangeText={setShippingAddress}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                    
                    <View style={styles.addressFormActions}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setShowAddressForm(false)}
                      >
                        <Text style={styles.cancelButtonText}>Hủy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => {
                          if (shippingPhone && shippingAddress) {
                            setShowAddressForm(false);
                          } else {
                            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
                          }
                        }}
                      >
                        <Text style={styles.saveButtonText}>Lưu</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cash_on_delivery' && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentMethod('cash_on_delivery')}
            >
              <View style={styles.paymentOptionContent}>
                <View style={styles.radio}>
                  {paymentMethod === 'cash_on_delivery' && (
                    <View style={styles.radioSelected} />
                  )}
                </View>
                <Text style={styles.paymentOptionText}>Thanh toán khi nhận hàng</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'bank_transfer' && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentMethod('bank_transfer')}
            >
              <View style={styles.paymentOptionContent}>
                <View style={styles.radio}>
                  {paymentMethod === 'bank_transfer' && (
                    <View style={styles.radioSelected} />
                  )}
                </View>
                <Text style={styles.paymentOptionText}>Chuyển khoản ngân hàng</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'credit_card' && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentMethod('credit_card')}
            >
              <View style={styles.paymentOptionContent}>
                <View style={styles.radio}>
                  {paymentMethod === 'credit_card' && (
                    <View style={styles.radioSelected} />
                  )}
                </View>
                <Ionicons name="card-outline" size={20} color={theme.primary} style={styles.paymentIcon} />
                <Text style={styles.paymentOptionText}>Thẻ tín dụng</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'qr_code' && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentMethod('qr_code')}
            >
              <View style={styles.paymentOptionContent}>
                <View style={styles.radio}>
                  {paymentMethod === 'qr_code' && (
                    <View style={styles.radioSelected} />
                  )}
                </View>
                <Ionicons name="qr-code-outline" size={20} color={theme.primary} style={styles.paymentIcon} />
                <Text style={styles.paymentOptionText}>QR Code</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập ghi chú đơn hàng (tùy chọn)"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Footer - Total and Place Order Button */}
        <View style={styles.footer}>
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tạm tính:</Text>
              <Text style={styles.totalValue}>
                {calculateSubtotal().toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Phí ship:</Text>
              <Text style={styles.totalValue}>
                {SHIPPING_FEE.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
            <View style={[styles.totalRow, styles.totalFinalRow]}>
              <Text style={styles.totalFinalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalFinalAmount}>
                {calculateTotal().toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.placeOrderButton,
              (isSubmitting || isCreatingOrder) && styles.placeOrderButtonDisabled
            ]}
            onPress={handlePlaceOrder}
            disabled={isSubmitting || isCreatingOrder}
          >
            {isSubmitting || isCreatingOrder ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.placeOrderText}>Đặt hàng</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  // Product item
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productCode: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  productQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  productTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  // Form inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
  },
  // Payment options
  paymentOption: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB05',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  paymentIcon: {
    marginRight: 8,
  },
  // Address styles
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addressCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressCardText: {
    marginLeft: 12,
    flex: 1,
  },
  addressCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  addressCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  addAddressButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  savedAddressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  savedAddressText: {
    marginLeft: 12,
    flex: 1,
  },
  savedAddressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 4,
  },
  savedAddressValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
    lineHeight: 20,
  },
  savedAddressPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  editAddressButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressForm: {
    marginTop: 12,
  },
  addressFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  totalSection: {
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalFinalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalFinalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalFinalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
  },
  placeOrderButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Empty products styles
  emptyProductsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyProductsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

