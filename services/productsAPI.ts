import { api } from '../lib/api';

// Định nghĩa interface cho Product
export interface Product {
  _id: string;
  name: string;
  code: string;
  description: string;
  categoryId: string;
  isActive: boolean;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa interface cho Product Variant
export interface ProductVariant {
  _id: string;
  productId: string;
  variant: {
    variant: string;
    value: string;
  };
  inventory: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa interface cho API response
export interface ProductsResponse {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  items: Product[];
}

export interface ProductVariantsResponse {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  items: ProductVariant[];
}

// Định nghĩa interface cho query parameters
export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    isActive?: boolean;
    categoryId?: string;
  };
}

export interface ProductVariantsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    productId?: string;
    isActive?: boolean;
  };
}

/**
 * Products API Service
 * Xử lý tất cả API calls liên quan đến sản phẩm
 */
export class ProductsAPI {
  /**
   * Lấy danh sách sản phẩm với phân trang và filter
   * @param params - Query parameters
   * @returns Promise<ProductsResponse> - Danh sách sản phẩm
   */
  static async getProducts(params: ProductsQueryParams = {}): Promise<ProductsResponse> {
    try {
      console.log('Calling GET /api/v1/products with params:', params);
      
      const response = await api.get('/v1/products', { params });
      const data = response.data;
      
      console.log('GET products successful:', data);
      
      // Handle different response structures
      if (data.data) {
        return data.data; // If response has nested data structure
      }
      return data; // If response is direct
    } catch (error: any) {
      console.error('GET products error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error('Tham số truy vấn không hợp lệ');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Không thể tải danh sách sản phẩm. Vui lòng thử lại');
    }
  }

  /**
   * Lấy thông tin chi tiết một sản phẩm
   * @param id - ID của sản phẩm
   * @returns Promise<Product> - Thông tin sản phẩm
   */
  static async getProductById(id: string): Promise<Product> {
    try {
      console.log('Calling GET /api/v1/products with ID:', id);
      
      const response = await api.get(`/v1/products/${id}`);
      const data = response.data;
      
      console.log('GET product by ID successful:', data);
      return data;
    } catch (error: any) {
      console.error('GET product by ID error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy sản phẩm');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Không thể tải thông tin sản phẩm. Vui lòng thử lại');
    }
  }

  /**
   * Lấy danh sách product variants với phân trang và filter
   * @param params - Query parameters
   * @returns Promise<ProductVariantsResponse> - Danh sách product variants
   */
  static async getProductVariants(params: ProductVariantsQueryParams = {}): Promise<ProductVariantsResponse> {
    try {
      console.log('Calling GET /api/v1/product-variants with params:', params);
      
      const response = await api.get('/v1/product-variants', { params });
      const data = response.data;
      
      console.log('GET product variants successful:', data);
      return data;
    } catch (error: any) {
      console.error('GET product variants error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error('Tham số truy vấn không hợp lệ');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Không thể tải danh sách biến thể sản phẩm. Vui lòng thử lại');
    }
  }

  /**
   * Lấy thông tin chi tiết một product variant
   * @param id - ID của product variant
   * @returns Promise<ProductVariant> - Thông tin product variant
   */
  static async getProductVariantById(id: string): Promise<ProductVariant> {
    try {
      console.log('Calling GET /api/v1/product-variants with ID:', id);
      
      const response = await api.get(`/v1/product-variants/${id}`);
      const data = response.data;
      
      console.log('GET product variant by ID successful:', data);
      return data;
    } catch (error: any) {
      console.error('GET product variant by ID error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy biến thể sản phẩm');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Không thể tải thông tin biến thể sản phẩm. Vui lòng thử lại');
    }
  }

  /**
   * Lấy product variants theo product ID
   * @param productId - ID của sản phẩm
   * @param params - Query parameters bổ sung
   * @returns Promise<ProductVariantsResponse> - Danh sách variants của sản phẩm
   */
  static async getProductVariantsByProductId(
    productId: string, 
    params: Omit<ProductVariantsQueryParams, 'filters'> = {}
  ): Promise<ProductVariantsResponse> {
    try {
      console.log('Calling GET /api/v1/product-variants for product ID:', productId);
      
      const queryParams = {
        ...params,
        filters: {
          productId,
          isActive: true
        }
      };
      
      const response = await api.get('/v1/product-variants', { params: queryParams });
      const data = response.data;
      
      console.log('GET product variants by product ID successful:', data);
      return data;
    } catch (error: any) {
      console.error('GET product variants by product ID error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error('Tham số truy vấn không hợp lệ');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Không thể tải biến thể sản phẩm. Vui lòng thử lại');
    }
  }
}
