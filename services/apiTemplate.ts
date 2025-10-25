import { api } from '../lib/api';

/**
 * API Template - Template for creating new API services
 * Copy this file and modify for your specific API needs
 */
export class APITemplate {
  /**
   * Example GET request
   * @param id - Resource ID
   * @returns Promise<any> - Response data
   */
  static async getById(id: string): Promise<any> {
    try {
      console.log('Calling GET API with ID:', id);
      
      const response = await api.get(`/endpoint/${id}`);
      const data = response.data;
      
      console.log('GET API successful:', data);
      return data;
    } catch (error: any) {
      console.error('GET API error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy dữ liệu');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Lỗi không xác định. Vui lòng thử lại');
    }
  }

  /**
   * Example POST request
   * @param data - Request payload
   * @returns Promise<any> - Response data
   */
  static async create(data: any): Promise<any> {
    try {
      console.log('Calling POST API with data:', data);
      
      const response = await api.post('/endpoint', data);
      const result = response.data;
      
      console.log('POST API successful:', result);
      return result;
    } catch (error: any) {
      console.error('POST API error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Dữ liệu không hợp lệ';
        throw new Error(message);
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Tạo thất bại. Vui lòng thử lại');
    }
  }

  /**
   * Example PUT request
   * @param id - Resource ID
   * @param data - Update payload
   * @returns Promise<any> - Response data
   */
  static async update(id: string, data: any): Promise<any> {
    try {
      console.log('Calling PUT API with ID:', id, 'data:', data);
      
      const response = await api.put(`/endpoint/${id}`, data);
      const result = response.data;
      
      console.log('PUT API successful:', result);
      return result;
    } catch (error: any) {
      console.error('PUT API error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy dữ liệu để cập nhật');
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Dữ liệu không hợp lệ';
        throw new Error(message);
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Cập nhật thất bại. Vui lòng thử lại');
    }
  }

  /**
   * Example DELETE request
   * @param id - Resource ID
   * @returns Promise<void>
   */
  static async delete(id: string): Promise<void> {
    try {
      console.log('Calling DELETE API with ID:', id);
      
      await api.delete(`/endpoint/${id}`);
      
      console.log('DELETE API successful');
    } catch (error: any) {
      console.error('DELETE API error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy dữ liệu để xóa');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Xóa thất bại. Vui lòng thử lại');
    }
  }
}
