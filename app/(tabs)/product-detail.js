// Màn hình chi tiết sản phẩm: hiển thị info, variants, chọn số lượng và thêm vào giỏ
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { ProductsAPI } from '../../services/productsAPI';
import { ProductVariantsAPI } from '../../services/productVariantsAPI';
import { useCartViewModel } from '../../viewmodels/useCartViewModel';

export default function ProductDetailScreen() {
  // Force light mode
  const colorScheme = 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { productId, from } = useLocalSearchParams();
  
  // Cart functionality
  const { addToCart, isAddingToCart, cartItems } = useCartViewModel();
  const cartItemsCount = cartItems?.length || 0;
  
  // State management
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Tải thông tin chi tiết sản phẩm
  const loadProductDetails = async () => {
    try {
      setLoading(true);
      console.log('Loading product details for ID:', productId);
      const response = await ProductsAPI.getProductById(productId);
      console.log('Product response:', response);
      // API có thể trả về { data: {...} } hoặc {...} trực tiếp
      const productData = response.data || response;
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product details:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Tải các biến thể sản phẩm (để chọn giá/thuộc tính)
  const loadProductVariants = async () => {
    try {
      setVariantsLoading(true);
      console.log('Loading product variants for product ID:', productId);
      const variantsData = await ProductVariantsAPI.getVariantsByProductId(productId);
      console.log('Variants response:', variantsData);
      
      // variantsData có thể là array trực tiếp hoặc có nested
      const variants = Array.isArray(variantsData) ? variantsData : (variantsData.items || []);
      setVariants(variants);
      
      // Set first variant as selected by default
      if (variants.length > 0) {
        setSelectedVariant(variants[0]);
      }
    } catch (error) {
      console.error('Error loading product variants:', error);
      // Don't show error alert for variants, just log it
    } finally {
      setVariantsLoading(false);
    }
  };

  // Tải dữ liệu khi mount
  useEffect(() => {
    if (productId) {
      loadProductDetails();
      loadProductVariants();
    }
  }, [productId]);

  // Thêm vào giỏ hàng với variant đã chọn và số lượng
  const handleAddToCart = async () => {
    try {
      if (!product || !selectedVariant) {
        Alert.alert('Lỗi', 'Vui lòng chọn biến thể sản phẩm');
        return;
      }

      const result = await addToCart({
        productId: product._id,
        productVariantId: selectedVariant._id,
        quantity: quantity
      });
      
      // Check if it was saved locally due to API failure
      if (result._id && result._id.startsWith('local_')) {
        Alert.alert(
          'Đã thêm vào giỏ hàng', 
          'Sản phẩm đã được thêm vào giỏ hàng. Dữ liệu sẽ được đồng bộ khi server sẵn sàng.'
        );
      } else {
        Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      Alert.alert('Lỗi', err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  // Chọn biến thể
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1); // Reset quantity when changing variant
  };

  // Thay đổi số lượng (giới hạn [1, tồn kho])
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (selectedVariant?.inventory || 1)) {
      setQuantity(newQuantity);
    }
  };

  // Render một lựa chọn biến thể
  const renderVariantOption = (variant) => (
    <TouchableOpacity
      key={variant._id}
      style={[
        styles.variantOption,
        selectedVariant?._id === variant._id && styles.selectedVariantOption,
        { borderColor: selectedVariant?._id === variant._id ? theme.primary : theme.muted }
      ]}
      onPress={() => handleVariantSelect(variant)}
    >
      <Text style={[
        styles.variantText,
        { color: selectedVariant?._id === variant._id ? theme.primary : theme.text }
      ]}>
        {variant.variant.variant}: {variant.variant.value}
      </Text>
      <Text style={[
        styles.variantPrice,
        { color: selectedVariant?._id === variant._id ? theme.primary : theme.tabIconDefault }
      ]}>
        {variant.price.toLocaleString('vi-VN')} VNĐ
      </Text>
      <Text style={[styles.variantInventory, { color: theme.tabIconDefault }]}>
        Còn lại: {variant.inventory}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Đang tải thông tin sản phẩm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.tabIconDefault} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Không tìm thấy sản phẩm</Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              // If navigating from cart, go back to cart
              if (from === 'cart') {
                router.push('/(tabs)/cart');
              } else {
                router.back();
              }
            }}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.muted }]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            // If navigating from cart, go back to cart
            if (from === 'cart') {
              router.push('/(tabs)/cart');
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Chi tiết sản phẩm</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/(tabs)/cart')}
        >
          <Ionicons name="cart-outline" size={24} color={theme.text} />
          {cartItemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.badgeText}>{cartItemsCount > 99 ? '99+' : cartItemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Product Icon thay vì ảnh */}
        <View style={styles.imageContainer}>
          <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="cube-outline" size={120} color={theme.primary} />
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.text }]}>
            {product.name}
          </Text>
          <Text style={[styles.productCode, { color: theme.tabIconDefault }]}>
            Mã sản phẩm: {product.code}
          </Text>
          <Text style={[styles.productCategory, { color: theme.primary }]}>
            {product.categoryName}
          </Text>
          
          {product.description && (
            <Text style={[styles.productDescription, { color: theme.text }]}>
              {product.description}
            </Text>
          )}
        </View>

        {/* Variants Section */}
        {variants.length > 0 && (
          <View style={styles.variantsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tùy chọn sản phẩm</Text>
            {variantsLoading ? (
              <View style={styles.variantsLoading}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.variantsLoadingText, { color: theme.tabIconDefault }]}>
                  Đang tải tùy chọn...
                </Text>
              </View>
            ) : (
              <View style={styles.variantsList}>
                {variants.map(renderVariantOption)}
              </View>
            )}
          </View>
        )}

        {/* Price and Quantity */}
        {selectedVariant && (
          <View style={styles.priceSection}>
            <View style={styles.priceInfo}>
              <Text style={[styles.priceLabel, { color: theme.text }]}>Giá:</Text>
              <Text style={[styles.priceValue, { color: theme.primary }]}>
                {selectedVariant.price.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
            
            <View style={styles.quantitySection}>
              <Text style={[styles.quantityLabel, { color: theme.text }]}>Số lượng:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.quantityButton, { backgroundColor: theme.muted }]}
                  onPress={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={20} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.quantityText, { color: theme.text }]}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.quantityButton, { backgroundColor: theme.muted }]}
                  onPress={() => handleQuantityChange(1)}
                  disabled={quantity >= selectedVariant.inventory}
                >
                  <Ionicons name="add" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Add to Cart Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              { backgroundColor: theme.primary },
              (!selectedVariant || selectedVariant.inventory === 0) && styles.disabledButton
            ]}
            onPress={handleAddToCart}
            disabled={isAddingToCart || !selectedVariant || selectedVariant.inventory === 0}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="cart" size={20} color="white" />
                <Text style={styles.addToCartText}>
                  {selectedVariant?.inventory === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  },
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Icon styles (thay vì Image)
  imageContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Product info styles
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 32,
  },
  productCode: {
    fontSize: 14,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  productDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Variants styles
  variantsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  variantsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  variantsLoadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  variantsList: {
    gap: 12,
  },
  variantOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  selectedVariantOption: {
    backgroundColor: '#F0F7FF',
  },
  variantText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  variantPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  variantInventory: {
    fontSize: 14,
  },
  // Price and quantity styles
  priceSection: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  // Action styles
  actionSection: {
    padding: 16,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
