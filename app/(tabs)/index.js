import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from '../../components/Toast';
import Colors from '../../constants/Colors';
import { ProductVariantsAPI } from '../../services/productVariantsAPI';
import { useCartViewModel } from '../../viewmodels/useCartViewModel';
import { useHomeViewModel } from '../../viewmodels/useHomeViewModel';

// Category icons mapping với Ionicons hiện đại
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'RAM laptop': 'hardware-chip',
    'PC': 'desktop',
    'Ổ cứng SSD di động': 'server',
    'Ổ cứng HDD di động': 'disc',
    'Module Arduino/Raspberry Pi': 'construct',
    'Cảm biến': 'radio',
    'IC & Vi điều khiển': 'flash',
    'Linh kiện cơ bản': 'bulb',
    'Điện tử': 'battery-charging',
    'Máy tính': 'laptop',
    'Phụ kiện': 'headset',
    'Khác': 'cube'
  };
  
  // Tìm icon phù hợp dựa trên tên category
  for (const [key, icon] of Object.entries(iconMap)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  return 'cube'; // Default icon
};

export default function HomeScreen() {
  // Force light mode
  const colorScheme = 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { state, actions } = useHomeViewModel();
  const { categories, featuredProducts, loading, error } = state;
  const { loadData, refreshData, clearError } = actions;
  
  // Get cart functionality
  const { cartItems, addToCart } = useCartViewModel();
  const cartItemsCount = cartItems?.length || 0;
  
  // State for segmented control
  const [selectedSegment, setSelectedSegment] = useState(0);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  
  // State for product prices
  const [productPrices, setProductPrices] = useState({});

  // Load product prices from variants
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const prices = {};
        for (const product of featuredProducts) {
          try {
            const variants = await ProductVariantsAPI.getVariantsByProductId(product._id);
            if (variants && variants.length > 0) {
              // Lấy variant có giá thấp nhất
              const minPriceVariant = variants.reduce((min, variant) => 
                variant.price < min.price ? variant : min
              );
              prices[product._id] = minPriceVariant.price;
            }
          } catch (error) {
            console.error(`Error loading price for product ${product._id}:`, error);
          }
        }
        setProductPrices(prices);
      } catch (error) {
        console.error('Error loading product prices:', error);
      }
    };
    
    if (featuredProducts.length > 0) {
      loadPrices();
    }
  }, [featuredProducts]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle refresh
  const handleRefresh = () => {
    refreshData();
  };

  // Handle error
  const handleErrorDismiss = () => {
    clearError();
  };

  // Handle segment change with animation
  const handleSegmentChange = (segmentIndex) => {
    setSelectedSegment(segmentIndex);
    Animated.timing(slideAnimation, {
      toValue: segmentIndex,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Handle add to cart
  const handleAddToCart = async (product) => {
    try {
      // Get the first variant of the product
      let productVariantId = product._id; // Fallback to product ID
      
      try {
        const variants = await ProductVariantsAPI.getVariantsByProductId(product._id);
        if (variants && variants.length > 0) {
          productVariantId = variants[0]._id;
        }
      } catch (variantError) {
        console.warn('Could not load variants, using product ID as variant ID:', variantError);
      }

      await addToCart({
        productId: product._id,
        productVariantId: productVariantId,
        quantity: 1
      });
      
      // Show success message
      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
    } catch (err) {
      console.error('Add to cart error:', err);
      Alert.alert('Lỗi', err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => {
        // Navigate to products with filter
        console.log('Navigate to category:', item.name);
        router.push('/(tabs)/product');
      }}
    >
      <View style={styles.categoryIconContainer}>
        <Ionicons name={getCategoryIcon(item.name)} size={24} color={theme.primary} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        // Navigate to product detail
        router.push({
          pathname: '/(tabs)/product-detail',
          params: { productId: item._id }
        });
      }}
    >
      {/* Cart icon in top right corner */}
      <TouchableOpacity
        style={styles.cartIconContainer}
        onPress={(e) => {
          e.stopPropagation(); // Prevent parent TouchableOpacity from triggering
          // Add to cart functionality
          handleAddToCart(item);
        }}
      >
        <Ionicons name="cart-outline" size={20} color={theme.primary} />
      </TouchableOpacity>

      {/* Icon container thay vì ảnh */}
      <View style={styles.productIconContainer}>
        <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '15' }]}>
          <Ionicons name="cube-outline" size={40} color={theme.primary} />
        </View>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productCode}>
          Mã: {item.code}
        </Text>
        <Text style={[styles.productCategory, { color: theme.primary }]}>
          {item.categoryName}
        </Text>
        {/* Hiển thị giá từ product variants */}
        {productPrices[item._id] && (
          <Text style={[styles.productPrice, { color: theme.primary }]}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(productPrices[item._id])}
          </Text>
        )}
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={(e) => {
            e.stopPropagation(); // Prevent parent TouchableOpacity from triggering
            router.push({
              pathname: '/(tabs)/product-detail',
              params: { productId: item._id }
            });
          }}
        >
          <Ionicons name="eye-outline" size={16} color="white" />
          <Text style={styles.addToCartText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Segmented Control Component with smooth animation
  const SegmentedControl = () => {
    const segmentWidth = slideAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={[styles.segmentedControl, { backgroundColor: theme.muted }]}>
        <Animated.View
          style={[
            styles.segmentIndicator,
            {
              backgroundColor: theme.primary,
              left: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['2%', '52%'],
              }),
            }
          ]}
        />
        <TouchableOpacity
          style={styles.segmentButton}
          onPress={() => handleSegmentChange(0)}
        >
          <Text style={[
            styles.segmentText,
            { color: selectedSegment === 0 ? 'white' : theme.text }
          ]}>
            Sản phẩm nổi bật
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.segmentButton}
          onPress={() => handleSegmentChange(1)}
        >
          <Text style={[
            styles.segmentText,
            { color: selectedSegment === 1 ? 'white' : theme.text }
          ]}>
            Danh mục
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Toast
        visible={!!error}
        message={error || ''}
        type="error"
        onHide={handleErrorDismiss}
      />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.shopName, { color: theme.text }]}>ElectroStore</Text>
          <Text style={[styles.shopSubtitle, { color: theme.tabIconDefault }]}>Linh kiện điện tử</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Ionicons name="cart-outline" size={24} color={theme.text} />
            {cartItemsCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.badgeText}>{cartItemsCount > 99 ? '99+' : cartItemsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.section}>
        <SegmentedControl />
      </View>

      {/* Content based on selected segment */}
      {selectedSegment === 0 ? (
        /* Featured Products Section */
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Sản phẩm nổi bật</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/product')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {loading && featuredProducts.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.text }]}>Đang tải sản phẩm...</Text>
            </View>
          ) : (
            <FlatList
              data={featuredProducts.slice(0, 4)} // Chỉ hiển thị 4 sản phẩm
              renderItem={renderProduct}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsList}
            />
          )}
        </View>
      ) : (
        /* Categories Section */
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Danh mục sản phẩm</Text>
          </View>
          {loading && categories.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.text }]}>Đang tải danh mục...</Text>
            </View>
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.categoriesList}
            />
          )}
        </View>
      )}

      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flex: 1,
  },
  shopName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  shopSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
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
  avatarContainer: {
    padding: 4,
  },
  // Section styles
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    marginBottom: 16,
  },
  sectionSubtitleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Categories styles
  categoriesList: {
    paddingBottom: 8,
  },
  categoryCard: {
    flex: 1,
    margin: 6,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    color: '#2c3e50',
  },
  // Products styles
  productsList: {
    paddingBottom: 8,
  },
  productCard: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    padding: 12,
    minHeight: 260, // Chiều cao cố định để các card đồng đều
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative', // For absolute positioning of cart icon
  },
  cartIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  productIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginBottom: 12,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between', // Để nút ở cuối card
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#333',
  },
  reviewsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addToCartText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Loading styles
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Product info styles
  productCode: {
    fontSize: 12,
    marginBottom: 4,
    color: '#6B7280',
  },
  productCategory: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  // Segmented Control styles
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  segmentIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '48%',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
});


