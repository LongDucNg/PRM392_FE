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
      console.log('Full cart response:', response.data);
      
      // API returns { data: {...}, message: "...", success: true }
      const apiResponse = response.data;
      let cart;
      
      if (apiResponse?.data) {
        cart = apiResponse.data;
      } else if (apiResponse?.cart) {
        cart = apiResponse.cart;
      } else {
        cart = apiResponse;
      }
      
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
      console.log('Thêm sản phẩm vào giỏ hàng:', {
        productId: data.productId,
        productVariantId: data.productVariantId,
        quantity: data.quantity
      });
      
      // Log request details for debugging
      console.log('API Request Details:', {
        url: '/v1/cart-items/add-to-cart',
        method: 'POST',
        data: data,
        timestamp: new Date().toISOString()
      });
      
      const response = await api.post('/v1/cart-items/add-to-cart', data);
      const responseData = response.data;
      
      // Handle new API response structure
      if (responseData.success && responseData.data) {
        const cartItemData = responseData.data;
        
        // Convert $numberDecimal to number
        const cartItem: CartItem = {
          _id: cartItemData._id,
          cartId: cartItemData.cartId,
          productId: cartItemData.productId,
          productVariantId: cartItemData.productVariantId,
          quantity: cartItemData.quantity,
          unitPrice: typeof cartItemData.unitPrice === 'object' && cartItemData.unitPrice.$numberDecimal 
            ? parseFloat(cartItemData.unitPrice.$numberDecimal)
            : cartItemData.unitPrice || 0,
          totalPrice: typeof cartItemData.totalPrice === 'object' && cartItemData.totalPrice.$numberDecimal 
            ? parseFloat(cartItemData.totalPrice.$numberDecimal)
            : cartItemData.totalPrice || 0,
          createdAt: cartItemData.createdAt,
          updatedAt: cartItemData.updatedAt
        };
        
        console.log('Thêm vào giỏ hàng thành công:', cartItem);
        return cartItem;
      } else {
        throw new Error(responseData.message || 'Thêm vào giỏ hàng thất bại');
      }
    } catch (error: any) {
      // Only log non-server errors in detail
      if (error.response?.status >= 500) {
        // Server error - will be handled by fallback, just throw
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      }
      
      console.error('Lỗi thêm vào giỏ hàng:', error);
      
      // Enhanced error logging for non-server errors
      console.error('Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Dữ liệu không hợp lệ';
        throw new Error(message);
      } else if (error.response?.status === 401) {
        throw new Error('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
      } else if (error.response?.status === 404) {
        const message = error.response?.data?.message || 'Không tìm thấy sản phẩm hoặc biến thể sản phẩm';
        throw new Error(message);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
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

  /**
   * Xóa toàn bộ sản phẩm khỏi giỏ hàng
   * @param cartItemIds - Danh sách ID của các item cần xóa
   * @returns Promise<void>
   */
  static async clearAllCartItems(cartItemIds: string[]): Promise<void> {
    try {
      console.log('Xóa toàn bộ sản phẩm khỏi giỏ hàng:', cartItemIds.length, 'items');
      
      // Xóa từng item
      const deletePromises = cartItemIds.map(id => 
        api.delete(`/v1/cart-items/delete-item/${id}`)
      );
      
      await Promise.all(deletePromises);
      
      console.log('Xóa toàn bộ sản phẩm khỏi giỏ hàng thành công');
    } catch (error: any) {
      console.error('Lỗi xóa toàn bộ sản phẩm khỏi giỏ hàng:', error);
      
      if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Xóa toàn bộ sản phẩm khỏi giỏ hàng thất bại. Vui lòng thử lại');
    }
  }
}

/**
 * Get Cart Items for current user
 */
export class CartItemsService {
  static async getMyCartItems(): Promise<CartItem[]> {
    try {
      console.log('Lấy danh sách cart items...');
      
      const response = await api.get('/v1/cart-items/me');
      console.log('Full cart items response:', response.data);
      
      // API returns { data: [...], message: "...", success: true }
      const apiResponse = response.data;
      let cartItems: CartItem[] = [];
      
      if (apiResponse?.data) {
        cartItems = Array.isArray(apiResponse.data) ? apiResponse.data : [];
      } else if (apiResponse?.items) {
        cartItems = Array.isArray(apiResponse.items) ? apiResponse.items : [];
      } else if (Array.isArray(apiResponse)) {
        cartItems = apiResponse;
      }
      
      // Convert $numberDecimal to number if needed
      cartItems = cartItems.map((item: any) => ({
        ...item,
        unitPrice: typeof item.unitPrice === 'object' && item.unitPrice?.$numberDecimal
          ? parseFloat(item.unitPrice.$numberDecimal)
          : item.unitPrice || 0,
        totalPrice: typeof item.totalPrice === 'object' && item.totalPrice?.$numberDecimal
          ? parseFloat(item.totalPrice.$numberDecimal)
          : item.totalPrice || 0
      }));
      
      console.log('Lấy cart items thành công:', cartItems.length, 'items');
      return cartItems;
    } catch (error: any) {
      console.error('Lỗi lấy cart items:', error);
      
      if (error.response?.status === 404) {
        console.log('Không có cart items, trả về mảng rỗng');
        return [];
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Lấy danh sách giỏ hàng thất bại. Vui lòng thử lại');
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
      
      // Extract order from response data wrapper
      const orderData = response.data?.data || response.data;
      
      console.log('Tạo đơn hàng thành công:', orderData);
      return orderData;
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
      console.log('Full response từ API:', JSON.stringify(response.data, null, 2));
      
      // Response structure from logs: 
      // { data: { items: [...], meta: {...} }, message, statusCode, success }
      // So response.data is { data: {...}, message, ... }
      // And response.data.data is { items: [...], meta: {...} }
      const responseData = response.data;
      console.log('Response.data:', responseData);
      
      let ordersResponse;
      if (responseData?.data && responseData.data.items) {
        // Double nesting: response.data.data has items
        ordersResponse = responseData.data;
        console.log('Using response.data.data structure');
      } else if (responseData?.items) {
        // Single nesting: response.data has items
        ordersResponse = responseData;
        console.log('Using response.data structure');
      } else if (responseData) {
        // Fallback
        ordersResponse = responseData;
        console.log('Using response.data as fallback');
      } else {
        ordersResponse = { items: [], meta: { total: 0, page: 0, limit: 0, totalPages: 0 } };
        console.log('Using empty response');
      }
      
      console.log('Final ordersResponse:', ordersResponse);
      console.log('Items count:', ordersResponse.items?.length || 0);
      
      return ordersResponse;
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
      
      // Extract order from response data wrapper
      const orderData = response.data?.data || response.data;
      
      console.log('Lấy đơn hàng theo ID thành công:', orderData);
      return orderData;
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
