import { api } from '../lib/api';

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

export interface ProductVariantsResponse {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  items: ProductVariant[];
}

export interface ProductVariantsParams {
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

export class ProductVariantsAPI {
  /**
   * Lấy danh sách product variants
   */
  static async getProductVariants(params: ProductVariantsParams = {}): Promise<ProductVariantsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Thêm các tham số vào query string
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.filters?.productId) queryParams.append('productId', params.filters.productId);
      if (params.filters?.isActive !== undefined) queryParams.append('isActive', params.filters.isActive.toString());

      const queryString = queryParams.toString();
      const url = `/v1/product-variants${queryString ? `?${queryString}` : ''}`;
      
      console.log('Calling GET product-variants:', url);
      const response = await api.get(url);
      console.log('GET product-variants full response:', response.data);
      
      // API returns { data: {...}, message: "...", success: true }
      // Extract actual data
      const apiResponse = response.data;
      if (apiResponse?.data) {
        return apiResponse.data; // Return { items: [...], meta: {...} }
      }
      return apiResponse; // Fallback
    } catch (error) {
      console.error('Error fetching product variants:', error);
      throw new Error('Không thể tải danh sách biến thể sản phẩm');
    }
  }

  /**
   * Lấy chi tiết một product variant
   */
  static async getProductVariantById(id: string): Promise<ProductVariant> {
    try {
      console.log('Calling GET product-variant by ID:', id);
      const response = await api.get(`/v1/product-variants/${id}`);
      console.log('GET product-variant by ID full response:', response.data);
      
      // API returns { data: {...}, message: "...", success: true }
      const apiResponse = response.data;
      if (apiResponse?.data) {
        return apiResponse.data; // Return actual product variant object
      }
      return apiResponse; // Fallback
    } catch (error) {
      console.error('Error fetching product variant:', error);
      throw new Error('Không thể tải thông tin biến thể sản phẩm');
    }
  }

  /**
   * Lấy tất cả variants của một sản phẩm
   */
  static async getVariantsByProductId(productId: string): Promise<ProductVariant[]> {
    try {
      const response = await this.getProductVariants({
        filters: { productId, isActive: true },
        limit: 100 // Lấy tất cả variants
      });
      
      console.log('VariantsByProductId response structure:', response);
      
      // response có thể là { items: [...], meta: {...} } hoặc nested
      if (response?.items) {
        return response.items;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (error) {
      console.error('Error fetching product variants by product ID:', error);
      throw new Error('Không thể tải biến thể của sản phẩm');
    }
  }
}
