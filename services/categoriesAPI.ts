import { api } from '../lib/api';
import type { CategoriesQueryParams, CategoriesResponse, Category } from '../models';

/**
 * Categories API Service
 * Xử lý tất cả API calls liên quan đến danh mục sản phẩm
 */
export class CategoriesAPI {
  /**
   * Lấy danh sách categories với phân trang và filter
   * @param params - Query parameters
   * @returns Promise<CategoriesResponse> - Danh sách categories
   */
  static async getCategories(params: CategoriesQueryParams = {}): Promise<CategoriesResponse> {
    try {
      console.log('Calling GET /api/v1/categories with params:', params);
      
      const response = await api.get('/v1/categories', { params });
      const data = response.data;
      
      console.log('GET categories successful:', data);
      
      // Handle different response structures
      if (data.data) {
        return data.data; // If response has nested data structure
      }
      return data; // If response is direct
    } catch (error: any) {
      console.error('GET categories error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error('Tham số truy vấn không hợp lệ');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Không thể tải danh sách danh mục. Vui lòng thử lại');
    }
  }

  /**
   * Lấy thông tin chi tiết một category
   * @param id - ID của category
   * @returns Promise<Category> - Thông tin category
   */
  static async getCategoryById(id: string): Promise<Category> {
    try {
      console.log('Calling GET /api/v1/categories with ID:', id);
      
      const response = await api.get(`/v1/categories/${id}`);
      const data = response.data;
      
      console.log('GET category by ID successful:', data);
      return data;
    } catch (error: any) {
      console.error('GET category by ID error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy danh mục');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Không thể tải thông tin danh mục. Vui lòng thử lại');
    }
  }

  /**
   * Lấy danh sách categories đang hoạt động
   * @param params - Query parameters bổ sung
   * @returns Promise<CategoriesResponse> - Danh sách categories đang hoạt động
   */
  static async getActiveCategories(
    params: Omit<CategoriesQueryParams, 'filters'> = {}
  ): Promise<CategoriesResponse> {
    try {
      console.log('Calling GET /api/v1/categories for active categories');
      
      const queryParams = {
        ...params,
        filters: {
          isActive: true
        }
      };
      
      const response = await api.get('/v1/categories', { params: queryParams });
      const data = response.data;
      
      console.log('GET active categories successful:', data);
      
      // Handle different response structures
      if (data.data) {
        return data.data; // If response has nested data structure
      }
      return data; // If response is direct
    } catch (error: any) {
      console.error('GET active categories error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error('Tham số truy vấn không hợp lệ');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Không thể tải danh sách danh mục đang hoạt động. Vui lòng thử lại');
    }
  }

  /**
   * Tìm kiếm categories theo từ khóa
   * @param searchTerm - Từ khóa tìm kiếm
   * @param params - Query parameters bổ sung
   * @returns Promise<CategoriesResponse> - Danh sách categories tìm được
   */
  static async searchCategories(
    searchTerm: string,
    params: Omit<CategoriesQueryParams, 'search'> = {}
  ): Promise<CategoriesResponse> {
    try {
      console.log('Calling GET /api/v1/categories with search term:', searchTerm);
      
      const queryParams = {
        ...params,
        search: searchTerm
      };
      
      const response = await api.get('/v1/categories', { params: queryParams });
      const data = response.data;
      
      console.log('GET categories search successful:', data);
      
      // Handle different response structures
      if (data.data) {
        return data.data; // If response has nested data structure
      }
      return data; // If response is direct
    } catch (error: any) {
      console.error('GET categories search error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error('Tham số truy vấn không hợp lệ');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Không thể tìm kiếm danh mục. Vui lòng thử lại');
    }
  }
}
