import { useCallback, useState } from 'react';
import type { Category, Product } from '../models';
import { CategoriesAPI } from '../services/categoriesAPI';
import { ProductsAPI } from '../services/productsAPI';

export interface HomeState {
  categories: Category[];
  featuredProducts: Product[];
  loading: boolean;
  error: string | null;
}

export interface HomeActions {
  loadData: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export function useHomeViewModel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🏠 Loading home data...');

      // Load active categories
      console.log('📋 Loading categories...');
      const categoriesResponse = await CategoriesAPI.getActiveCategories({
        page: 1,
        limit: 8, // Hiển thị tối đa 8 categories
        sortBy: 'name',
        sortOrder: 'asc'
      });

      console.log('✅ Categories loaded:', categoriesResponse.items.length);
      setCategories(categoriesResponse.items);

      // Load featured products (chỉ 4 sản phẩm nổi bật)
      console.log('🛍️ Loading featured products...');
      
      // Load 4 sản phẩm nổi bật từ tất cả categories
      const featuredProductsResponse = await ProductsAPI.getProducts({
        page: 1,
        limit: 4, // Chỉ lấy 4 sản phẩm
        sortBy: 'createdAt',
        sortOrder: 'desc',
        filters: {
          isActive: true
        }
      });

      // Thêm category info vào products
      const productsWithCategory = featuredProductsResponse.items.map(product => {
        const category = categoriesResponse.items.find(cat => cat._id === product.categoryId);
        return {
          ...product,
          categoryName: category?.name || 'Khác'
        };
      });

      setFeaturedProducts(productsWithCategory);
      console.log('✅ Loaded featured products:', productsWithCategory.length);
      console.log('✅ Home data loaded successfully');

    } catch (err: any) {
      console.error('❌ Error loading home data:', err);
      setError(err.message || 'Không thể tải dữ liệu trang chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    console.log('🔄 Refreshing home data...');
    await loadData();
  }, [loadData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    state: {
      categories,
      featuredProducts,
      loading,
      error
    },
    actions: {
      loadData,
      refreshData,
      clearError
    }
  };
}
