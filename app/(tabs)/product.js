import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';
import { ProductsAPI } from '../../services/productsAPI';

export default function ProductsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load products function
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
      
      // Handle API response structure
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
      
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProducts(1, '', true);
  }, []);

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

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadProducts(currentPage + 1, searchText, false);
    }
  };

  // Render product item
  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: theme.background, borderColor: theme.muted }]}
      onPress={() => {
        // Navigate to product detail
        console.log('Navigate to product:', item.name);
      }}
    >
      <View style={styles.productImageContainer}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=' + encodeURIComponent(item.name) }} 
          style={styles.productImage} 
        />
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
      </View>
    </TouchableOpacity>
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Sản phẩm</Text>
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

      {/* Products List */}
      {loading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Đang tải sản phẩm...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
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
  // Products list styles
  productsList: {
    padding: 16,
  },
  productCard: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  inactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
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
