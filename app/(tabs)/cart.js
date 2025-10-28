// Màn hình Giỏ hàng: quản lý items, chọn/xoá, tính tổng, điều hướng checkout
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { ProductsAPI } from '../../services/productsAPI';
import { useCartViewModel } from '../../viewmodels/useCartViewModel';

export default function CartScreen() {
  // Force light mode
  const colorScheme = 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  
  const {
    cartItems,
    cart,
    error,
    refreshing,
    isLoading,
    fetchCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    clearAllCart,
    refreshCart,
    clearAllErrors
  } = useCartViewModel();

  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set()); // Track selected items
  const [productInfoMap, setProductInfoMap] = useState({}); // Map productId to product info

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Load product info for cart items
  useEffect(() => {
    const loadProductInfo = async () => {
      if (!cartItems || cartItems.length === 0) return;
      
      const productIds = [...new Set(cartItems.map(item => item.productId))];
      const infoMap = {};
      
      for (const productId of productIds) {
        try {
          const product = await ProductsAPI.getProductById(productId);
          infoMap[productId] = product;
        } catch (error) {
          console.error(`Error loading product ${productId}:`, error);
        }
      }
      
      setProductInfoMap(infoMap);
    };
    
    loadProductInfo();
  }, [cartItems]);

  // Clear selection when cart items change
  useEffect(() => {
    setSelectedItems(new Set());
  }, [cartItems]);

  useEffect(() => {
    if (error) {
      Alert.alert('Lỗi', error, [
        { text: 'OK', onPress: clearAllErrors }
      ]);
    }
  }, [error, clearAllErrors]);

  const handleRefresh = async () => {
    try {
      await refreshCart();
    } catch (err) {
      console.error('Lỗi refresh giỏ hàng:', err);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setIsUpdating(true);
    try {
      await updateCartItemQuantity(itemId, newQuantity);
    } catch (err) {
      console.error('Lỗi cập nhật số lượng:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng sản phẩm');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(itemId);
            } catch (err) {
              console.error('Lỗi xóa sản phẩm:', err);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            }
          }
        }
      ]
    );
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa tất cả', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllCart();
            } catch (err) {
              console.error('Lỗi xóa giỏ hàng:', err);
              Alert.alert('Lỗi', 'Không thể xóa giỏ hàng');
            }
          }
        }
      ]
    );
  };

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống');
      return;
    }
    
    // Navigate to checkout screen with all items
    router.push('/(tabs)/checkout');
  };

  const calculateTotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => {
      return total + (item.totalPrice || 0);
    }, 0);
  };

  // Calculate total for selected items
  const calculateSelectedTotal = () => {
    if (selectedItems.size === 0) return 0;
    return Array.from(selectedItems).reduce((total, itemId) => {
      const item = cartItems.find(i => i._id === itemId);
      return total + (item ? (item.totalPrice || 0) : 0);
    }, 0);
  };

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item._id)));
    }
  };

  // Handle checkout with selected items
  const handleSelectedCheckout = () => {
    if (selectedItems.size === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm');
      return;
    }
    
    // Navigate to checkout with selected items
    const selectedItemsArray = Array.from(selectedItems);
    router.push({
      pathname: '/(tabs)/checkout',
      params: { selectedItems: selectedItemsArray.join(',') }
    });
  };

  // Handle delete selected items
  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn xóa ${selectedItems.size} sản phẩm đã chọn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete each selected item
              const deletePromises = Array.from(selectedItems).map(itemId => 
                removeFromCart(itemId)
              );
              
              await Promise.all(deletePromises);
              
              // Clear selection
              setSelectedItems(new Set());
              
              Alert.alert('Thành công', 'Đã xóa các sản phẩm đã chọn');
            } catch (err) {
              console.error('Lỗi xóa sản phẩm đã chọn:', err);
              Alert.alert('Lỗi', 'Không thể xóa các sản phẩm đã chọn');
            }
          }
        }
      ]
    );
  };

  const handleItemPress = (productId) => {
    router.push({
      pathname: '/(tabs)/product-detail',
      params: { productId, from: 'cart' }
    });
  };

  const renderCartItem = ({ item }) => {
    const isSelected = selectedItems.has(item._id);
    const productInfo = productInfoMap[item.productId];
    const productName = productInfo?.name || 'Sản phẩm';
    const productCode = productInfo?.code;
    
    return (
      <View style={styles.cartItem}>
        {/* Top row: Checkbox + Icon + Product Info */}
        <View style={styles.cartItemTopRow}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => toggleItemSelection(item._id)}
          >
            <View style={[
              styles.checkbox,
              isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
            ]}>
              {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.itemIconContainer}
            onPress={() => handleItemPress(item.productId)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="cube-outline" size={40} color={theme.primary} />
            </View>
          </TouchableOpacity>
          
          {/* Middle section: Product Info */}
          <TouchableOpacity 
            style={styles.itemInfo}
            onPress={() => handleItemPress(item.productId)}
            activeOpacity={0.7}
          >
            <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
              {productName}
            </Text>
            {productCode && (
              <Text style={styles.itemCode} numberOfLines={1} ellipsizeMode="tail">
                Mã: {productCode}
              </Text>
            )}
            <Text style={[styles.itemPrice, { color: theme.primary }]} numberOfLines={1} ellipsizeMode="tail">
              {item.unitPrice?.toLocaleString('vi-VN') || '0'} VNĐ
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom row: Actions */}
        <View style={styles.itemActionsBottom}>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={[styles.quantityBtn, { backgroundColor: theme.muted }]}
              onPress={() => handleUpdateQuantity(item._id, item.quantity - 1)}
              disabled={isUpdating}
            >
              <Ionicons name="remove" size={16} color={theme.primary} />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={[styles.quantityBtn, { backgroundColor: theme.muted }]}
              onPress={() => handleUpdateQuantity(item._id, item.quantity + 1)}
              disabled={isUpdating}
            >
              <Ionicons name="add" size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.removeBtn}
            onPress={() => handleRemoveItem(item._id)}
            disabled={isUpdating}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color={theme.tabIconDefault} />
      <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
      <Text style={styles.emptySubtitle}>
        Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
      </Text>
      <TouchableOpacity 
        style={styles.shopNowBtn}
        onPress={() => router.push('/(tabs)/product')}
      >
        <Text style={styles.shopNowText}>Mua sắm ngay</Text>
      </TouchableOpacity>
    </View>
  );


  if (isLoading && (!cartItems || cartItems.length === 0)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Giỏ hàng</Text>
              {cartItems && cartItems.length > 0 && (
                <TouchableOpacity 
                  style={styles.selectAllBtn}
                  onPress={selectAllItems}
                >
                  <Text style={styles.selectAllText}>
                    {selectedItems.size === cartItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => router.push('/(tabs)/product')}
            >
              <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            {cartItems?.length || 0} sản phẩm trong giỏ hàng
          </Text>
        </View>

        {/* Cart Items */}
        {!cartItems || cartItems.length === 0 ? (
          renderEmptyCart()
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={[
              styles.cartList,
              selectedItems.size > 0 && { paddingBottom: 100 } // Add padding when checkout bar is visible
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
      {/* Floating Checkout Bar - Only show when items are selected */}
      {selectedItems.size > 0 && (
        <View style={styles.checkoutBar}>
          <View style={styles.checkoutBarInfo}>
            <Text style={styles.checkoutBarText}>
              {selectedItems.size} sản phẩm đã chọn
            </Text>
            <Text style={styles.checkoutBarTotal}>
              {calculateSelectedTotal().toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>
          <View style={styles.checkoutBarActions}>
            <TouchableOpacity 
              style={styles.deleteSelectedButton}
              onPress={handleDeleteSelected}
            >
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.checkoutBarButton}
              onPress={handleSelectedCheckout}
            >
              <Text style={styles.checkoutBarButtonText}>Đặt hàng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  // Header styles
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  selectAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  headerIcon: {
    padding: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  // Cart list styles
  cartList: {
    padding: 16,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'column', // Change to column layout
  },
  cartItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIconContainer: {
    marginRight: 12,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    flexShrink: 1, // Allow shrinking
    minWidth: 0, // Allow text to wrap properly
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemCode: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  itemActionsBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'flex-end', // Align to right
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 8,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopNowBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Checkout bar styles (floating at bottom)
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  checkoutBarInfo: {
    flex: 1,
  },
  checkoutBarText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  checkoutBarTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
  },
  checkoutBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteSelectedButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBarButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  checkoutBarButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
