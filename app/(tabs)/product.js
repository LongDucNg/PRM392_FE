// Màn hình danh sách sản phẩm: tìm kiếm, phân trang, lọc theo danh mục, thêm vào giỏ
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { ProductsAPI } from '../../services/productsAPI';
import { ProductVariantsAPI } from '../../services/productVariantsAPI';
import { useCartViewModel } from '../../viewmodels/useCartViewModel';

export default function ProductsScreen() {
  // Force light mode
  const colorScheme = 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { category } = useLocalSearchParams();
  
  // Cart functionality
  const { addToCart, isAddingToCart, cartItems } = useCartViewModel();
  const cartItemsCount = cartItems?.length || 0;
  
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [productPrices, setProductPrices] = useState({}); // Lưu price cho từng sản phẩm
  
  // Danh sách category mẫu (map với categoryName trong sản phẩm)
  const categories = [
    { id: 'all', name: 'Tất cả', icon: 'grid' },
    { id: 'CPU', name: 'CPU', icon: 'hardware-chip' },
    { id: 'GPU', name: 'GPU', icon: 'desktop' },
    { id: 'RAM', name: 'RAM', icon: 'hardware-chip' },
    { id: 'SSD', name: 'SSD', icon: 'save' },
    { id: 'HDD', name: 'HDD', icon: 'disc' },
    { id: 'Mainboard', name: 'Mainboard', icon: 'desktop' },
    { id: 'PSU', name: 'PSU', icon: 'flash' },
    { id: 'Monitor', name: 'Monitor', icon: 'tv' },
    { id: 'Keyboard', name: 'Keyboard', icon: 'keypad' },
    { id: 'Mouse', name: 'Mouse', icon: 'radio-button-on' },
  ];

  // Hàm tải danh sách sản phẩm kèm phân trang và tìm kiếm
  const loadProducts = async (page = 1, search = '', reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      }
      
      const params = {
        page,
        limit: 10,
        search: search.trim(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
        filters: {
          isActive: true
        }
      };

      const response = await ProductsAPI.getProducts(params);
      
      // Chuẩn hoá response từ API (có thể bọc trong data)
      const data = response.data || response;
      const items = data.items || [];
      const meta = data.meta || {};
      
      if (reset) {
        setProducts(items);
      } else {
        setProducts(prev => [...prev, ...items]);
      }
      
      setTotalPages(meta.totalPages || 1);
      setHasMore(page < (meta.totalPages || 1));
      setCurrentPage(page);
      
      // Tải giá từ product variants cho từng sản phẩm
      await loadProductPrices(items);
      
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Lấy giá thấp nhất từ các biến thể để hiển thị
  const loadProductPrices = async (productsToLoad) => {
    try {
      const prices = {};
      for (const product of productsToLoad) {
        try {
          // Lấy variant đầu tiên của sản phẩm để lấy price
          const variantsResponse = await ProductVariantsAPI.getVariantsByProductId(product._id);
          if (variantsResponse && variantsResponse.length > 0) {
            // Lấy variant có giá thấp nhất
            const minPriceVariant = variantsResponse.reduce((min, variant) => 
              variant.price < min.price ? variant : min
            );
            prices[product._id] = minPriceVariant.price;
          }
        } catch (error) {
          console.error(`Error loading price for product ${product._id}:`, error);
        }
      }
      setProductPrices(prev => ({ ...prev, ...prices }));
    } catch (error) {
      console.error('Error loading product prices:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadProducts(1, '', true);
  }, []);

  // Áp dụng filter category lấy từ params khi focus màn hình
  useFocusEffect(
    useCallback(() => {
      if (category && typeof category === 'string') {
        setSelectedCategory(category);
      }
      return () => {};
    }, [category])
  );

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadProducts(1, searchText, true);
  };

  // Handle search
  const handleSearch = (text) => {
    setSearchText(text);
    setCurrentPage(1);
    loadProducts(1, text, true);
  };

  // Handle category filter
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Lọc sản phẩm theo danh mục được chọn
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      // Filter trực tiếp theo categoryName (như "CPU", "GPU", "RAM", etc.)
      const filtered = products.filter(product => 
        product.categoryName === selectedCategory
      );
      
      console.log(`Filtering by category: ${selectedCategory}`);
      console.log(`Found ${filtered.length} products`);
      
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

  // Tải thêm khi scroll tới cuối danh sách
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadProducts(currentPage + 1, searchText, false);
    }
  };

  // Thêm nhanh vào giỏ: lấy biến thể đầu tiên làm mặc định
  const handleAddToCart = async (product) => {
    try {
      // Validate product data before adding to cart
      if (!product || !product._id) {
        Alert.alert('Lỗi', 'Thông tin sản phẩm không hợp lệ');
        return;
      }

      // Get the first variant of the product
      let productVariantId = product._id; // Fallback to product ID
      
      try {
        const variants = await ProductVariantsAPI.getVariantsByProductId(product._id);
        if (variants && variants.length > 0) {
          productVariantId = variants[0]._id;
        }
      } catch (variantError) {
        console.warn('Could not load variants, using product ID as variant ID:', variantError);
        // Continue with product ID as variant ID
      }

      console.log('Adding to cart:', {
        productId: product._id,
        productVariantId: productVariantId,
        quantity: 1,
        productName: product.name
      });

      const result = await addToCart({
        productId: product._id,
        productVariantId: productVariantId,
        quantity: 1
      });
      
      // Check if it was saved locally due to API failure
      if (result._id && result._id.startsWith('local_')) {
        // API failed but successfully saved to local storage
        Alert.alert(
          'Đã thêm vào giỏ hàng', 
          'Sản phẩm đã được thêm vào giỏ hàng. Dữ liệu sẽ được đồng bộ khi server sẵn sàng.'
        );
      } else {
        // Successfully saved to server
        Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      Alert.alert('Lỗi', err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  // Render một item sản phẩm trong lưới
  const renderProduct = ({ item }) => (
    <View style={[styles.productCard, { backgroundColor: theme.background, borderColor: theme.muted }]}>
      {/* Cart icon in top right corner */}
      <TouchableOpacity
        style={styles.cartIconContainer}
        onPress={() => handleAddToCart(item)}
        disabled={isAddingToCart || !item.isActive}
      >
        {isAddingToCart ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Ionicons name="cart-outline" size={20} color={theme.primary} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          // Navigate to product detail
          router.push({
            pathname: '/(tabs)/product-detail',
            params: { productId: item._id }
          });
        }}
        style={styles.productContent}
      >
        {/* Icon container thay vì ảnh */}
        <View style={styles.productIconContainer}>
          <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="cube-outline" size={48} color={theme.primary} />
          </View>
          {!item.isActive && (
            <View style={styles.inactiveOverlay}>
              <Text style={styles.inactiveText}>Không hoạt động</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.productCode, { color: theme.tabIconDefault }]}>
            Mã: {item.code}
          </Text>
          <Text style={[styles.productCategory, { color: theme.primary }]}>
            {item.categoryName}
          </Text>
          {item.description && (
            <Text style={[styles.productDescription, { color: theme.tabIconDefault }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          {/* Hiển thị giá từ product variants */}
          {productPrices[item._id] && (
            <Text style={[styles.productPrice, { color: theme.primary }]}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(productPrices[item._id])}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.addToCartBtn, { backgroundColor: theme.primary }]}
        onPress={() => handleAddToCart(item)}
        disabled={isAddingToCart || !item.isActive}
      >
        {isAddingToCart ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Render footer for loading more
  const renderFooter = () => {
    if (!loading || currentPage === 1) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={[styles.footerText, { color: theme.tabIconDefault }]}>Đang tải thêm...</Text>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={theme.tabIconDefault} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {searchText ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.tabIconDefault }]}>
        {searchText ? 'Thử tìm kiếm với từ khóa khác' : 'Sản phẩm sẽ được thêm vào sớm'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.muted }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Sản phẩm</Text>
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
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.tabIconDefault} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text, borderColor: theme.muted }]}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor={theme.tabIconDefault}
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.id && { backgroundColor: theme.primary }
              ]}
              onPress={() => handleCategoryFilter(item.id)}
            >
              <Ionicons 
                name={item.icon} 
                size={18} 
                color={selectedCategory === item.id ? 'white' : theme.text} 
              />
              <Text style={[
                styles.categoryText,
                { color: selectedCategory === item.id ? 'white' : theme.text }
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Products List */}
      {loading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Đang tải sản phẩm...</Text>
        </View>
      ) : (
        <FlatList
          data={selectedCategory === 'all' ? products : filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
      </View>
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
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerIcon: {
    position: 'relative',
    padding: 8,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  // Category filter styles
  categoryContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Products list styles
  productsList: {
    padding: 16,
  },
  productCard: {
    flex: 1,
    margin: 8,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative', // For absolute positioning of cart icon
  },
  cartIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  productContent: {
    flex: 1,
  },
  productIconContainer: {
    position: 'relative',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 20,
  },
  productCode: {
    fontSize: 12,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  addToCartBtn: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
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
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
