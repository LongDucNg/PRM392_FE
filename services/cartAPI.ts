import { api } from '../lib/api';
import {
    AddToCartRequest,
    Cart,
    CartItem,
    CreateOrderRequest,
    Order,
    OrdersQueryParams,
    OrdersResponse,
    UpdateCartItemRequest
} from '../models';

/**
 * Cart API Service - Quản lý giỏ hàng
 */
export class CartAPI {
  /**
   * Tạo giỏ hàng mới
   * @returns Promise<Cart> - Thông tin giỏ hàng được tạo
   */
  static async createCart(): Promise<Cart> {
    try {
      console.log('Tạo giỏ hàng mới...');
      
      const response = await api.post('/v1/cart');
      const cart = response.data;
      
      console.log('Tạo giỏ hàng thành công:', cart);
      return cart;
    } catch (error: any) {
      console.error('Lỗi tạo giỏ hàng:', error);
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Dữ liệu không hợp lệ';
        throw new Error(message);
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Tạo giỏ hàng thất bại. Vui lòng thử lại');
    }
  }

  /**
   * Lấy thông tin giỏ hàng của user hiện tại
   * @returns Promise<Cart> - Thông tin giỏ hàng
   */
  static async getMyCart(): Promise<Cart> {
    try {
      console.log('Lấy thông tin giỏ hàng...');
      
      const response = await api.get('/v1/cart/me');
      const cart = response.data;
      
      console.log('Lấy giỏ hàng thành công:', cart);
      return cart;
    } catch (error: any) {
      console.error('Lỗi lấy giỏ hàng:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy giỏ hàng');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Lấy giỏ hàng thất bại. Vui lòng thử lại');
    }
  }

  /**
   * Lấy thông tin giỏ hàng theo ID
   * @param id - ID của giỏ hàng
   * @returns Promise<Cart> - Thông tin giỏ hàng
   */
  static async getCartById(id: string): Promise<Cart> {
    try {
      console.log('Lấy thông tin giỏ hàng theo ID:', id);
      
      const response = await api.get(`/v1/cart/${id}`);
      const cart = response.data;
      
      console.log('Lấy giỏ hàng theo ID thành công:', cart);
      return cart;
    } catch (error: any) {
      console.error('Lỗi lấy giỏ hàng theo ID:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy giỏ hàng');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Lấy giỏ hàng thất bại. Vui lòng thử lại');
    }
  }
}

/**
 * Cart Items API Service - Quản lý sản phẩm trong giỏ hàng
 */
export class CartItemsAPI {
  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param data - Thông tin sản phẩm cần thêm
   * @returns Promise<CartItem> - Thông tin item đã thêm
   */
  static async addToCart(data: AddToCartRequest): Promise<CartItem> {
    try {
      console.log('Thêm sản phẩm vào giỏ hàng:', data);
      
      const response = await api.post('/v1/cart-items/add-to-cart', data);
      const cartItem = response.data;
      
      console.log('Thêm vào giỏ hàng thành công:', cartItem);
      return cartItem;
    } catch (error: any) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Dữ liệu không hợp lệ';
        throw new Error(message);
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Thêm vào giỏ hàng thất bại. Vui lòng thử lại');
    }
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   * @param data - Thông tin cập nhật
   * @returns Promise<CartItem> - Thông tin item đã cập nhật
   */
  static async updateCartItem(data: UpdateCartItemRequest): Promise<CartItem> {
    try {
      console.log('Cập nhật sản phẩm trong giỏ hàng:', data);
      
      const response = await api.patch('/v1/cart-items/update-cart-item', data);
      const cartItem = response.data;
      
      console.log('Cập nhật giỏ hàng thành công:', cartItem);
      return cartItem;
    } catch (error: any) {
      console.error('Lỗi cập nhật giỏ hàng:', error);
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Dữ liệu không hợp lệ';
        throw new Error(message);
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Cập nhật giỏ hàng thất bại. Vui lòng thử lại');
    }
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param cartItemId - ID của item cần xóa
   * @returns Promise<void>
   */
  static async deleteCartItem(cartItemId: string): Promise<void> {
    try {
      console.log('Xóa sản phẩm khỏi giỏ hàng:', cartItemId);
      
      await api.delete(`/v1/cart-items/delete-item/${cartItemId}`);
      
      console.log('Xóa sản phẩm khỏi giỏ hàng thành công');
    } catch (error: any) {
      console.error('Lỗi xóa sản phẩm khỏi giỏ hàng:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Xóa sản phẩm khỏi giỏ hàng thất bại. Vui lòng thử lại');
    }
  }
}

/**
 * Orders API Service - Quản lý đơn hàng
 */
export class OrdersAPI {
  /**
   * Tạo đơn hàng mới từ giỏ hàng
   * @param data - Thông tin đơn hàng
   * @returns Promise<Order> - Thông tin đơn hàng được tạo
   */
  static async createOrder(data: CreateOrderRequest): Promise<Order> {
    try {
      console.log('Tạo đơn hàng mới:', data);
      
      const response = await api.post('/v1/orders', data);
      const order = response.data;
      
      console.log('Tạo đơn hàng thành công:', order);
      return order;
    } catch (error: any) {
      console.error('Lỗi tạo đơn hàng:', error);
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Dữ liệu không hợp lệ';
        throw new Error(message);
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Tạo đơn hàng thất bại. Vui lòng thử lại');
    }
  }

  /**
   * Lấy danh sách đơn hàng
   * @param params - Tham số truy vấn
   * @returns Promise<OrdersResponse> - Danh sách đơn hàng
   */
  static async getOrders(params?: OrdersQueryParams): Promise<OrdersResponse> {
    try {
      console.log('Lấy danh sách đơn hàng:', params);
      
      const response = await api.get('/v1/orders', { params });
      const orders = response.data;
      
      console.log('Lấy danh sách đơn hàng thành công:', orders);
      return orders;
    } catch (error: any) {
      console.error('Lỗi lấy danh sách đơn hàng:', error);
      
      if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Lấy danh sách đơn hàng thất bại. Vui lòng thử lại');
    }
  }

  /**
   * Lấy thông tin đơn hàng theo ID
   * @param id - ID của đơn hàng
   * @returns Promise<Order> - Thông tin đơn hàng
   */
  static async getOrderById(id: string): Promise<Order> {
    try {
      console.log('Lấy thông tin đơn hàng theo ID:', id);
      
      const response = await api.get(`/v1/orders/${id}`);
      const order = response.data;
      
      console.log('Lấy đơn hàng theo ID thành công:', order);
      return order;
    } catch (error: any) {
      console.error('Lỗi lấy đơn hàng theo ID:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy đơn hàng');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Lấy đơn hàng thất bại. Vui lòng thử lại');
    }
  }
}
