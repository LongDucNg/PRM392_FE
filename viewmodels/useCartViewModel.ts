import { useCallback, useState } from 'react';
import {
    AddToCartRequest,
    CreateOrderRequest,
    OrdersQueryParams,
    UpdateCartItemRequest
} from '../models';
import { CartAPI, CartItemsAPI, OrdersAPI } from '../services/cartAPI';
import { useCartStore } from '../state/cart';

/**
 * Cart ViewModel - Logic xử lý giỏ hàng
 */
export const useCartViewModel = () => {
  const {
    cart,
    cartItems,
    orders,
    isLoading,
    isAddingToCart,
    isUpdatingCart,
    isDeletingFromCart,
    isCreatingOrder,
    isFetchingOrders,
    error,
    setCart,
    setCartItems,
    addCartItem,
    updateCartItem,
    removeCartItem,
    setOrders,
    addOrder,
    setLoading,
    setAddingToCart,
    setUpdatingCart,
    setDeletingFromCart,
    setCreatingOrder,
    setFetchingOrders,
    setError,
    clearError,
    getTotalItems,
    getTotalPrice,
    clearCart
  } = useCartStore();

  // Local state
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Khởi tạo giỏ hàng cho user mới
   */
  const initializeCart = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      console.log('Khởi tạo giỏ hàng...');
      const newCart = await CartAPI.createCart();
      setCart(newCart);
      
      console.log('Khởi tạo giỏ hàng thành công:', newCart);
    } catch (err: any) {
      console.error('Lỗi khởi tạo giỏ hàng:', err);
      setError(err.message || 'Không thể khởi tạo giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setCart, setError, clearError]);

  /**
   * Lấy thông tin giỏ hàng hiện tại
   */
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      console.log('Lấy thông tin giỏ hàng...');
      const cartData = await CartAPI.getMyCart();
      setCart(cartData);
      
      console.log('Lấy giỏ hàng thành công:', cartData);
    } catch (err: any) {
      console.error('Lỗi lấy giỏ hàng:', err);
      setError(err.message || 'Không thể lấy thông tin giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setCart, setError, clearError]);

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  const addToCart = useCallback(async (data: AddToCartRequest) => {
    try {
      setAddingToCart(true);
      clearError();
      
      console.log('Thêm sản phẩm vào giỏ hàng:', data);
      const cartItem = await CartItemsAPI.addToCart(data);
      
      // Cập nhật state
      addCartItem(cartItem);
      
      console.log('Thêm vào giỏ hàng thành công:', cartItem);
      return cartItem;
    } catch (err: any) {
      console.error('Lỗi thêm vào giỏ hàng:', err);
      setError(err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      throw err;
    } finally {
      setAddingToCart(false);
    }
  }, [setAddingToCart, addCartItem, setError, clearError]);

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  const updateCartItemQuantity = useCallback(async (data: UpdateCartItemRequest) => {
    try {
      setUpdatingCart(true);
      clearError();
      
      console.log('Cập nhật sản phẩm trong giỏ hàng:', data);
      const updatedItem = await CartItemsAPI.updateCartItem(data);
      
      // Cập nhật state
      updateCartItem(data.cartItemId, {
        quantity: data.quantity
      });
      
      console.log('Cập nhật giỏ hàng thành công:', updatedItem);
      return updatedItem;
    } catch (err: any) {
      console.error('Lỗi cập nhật giỏ hàng:', err);
      setError(err.message || 'Không thể cập nhật sản phẩm trong giỏ hàng');
      throw err;
    } finally {
      setUpdatingCart(false);
    }
  }, [setUpdatingCart, updateCartItem, setError, clearError]);

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  const removeFromCart = useCallback(async (cartItemId: string) => {
    try {
      setDeletingFromCart(true);
      clearError();
      
      console.log('Xóa sản phẩm khỏi giỏ hàng:', cartItemId);
      await CartItemsAPI.deleteCartItem(cartItemId);
      
      // Cập nhật state
      removeCartItem(cartItemId);
      
      console.log('Xóa sản phẩm khỏi giỏ hàng thành công');
    } catch (err: any) {
      console.error('Lỗi xóa sản phẩm khỏi giỏ hàng:', err);
      setError(err.message || 'Không thể xóa sản phẩm khỏi giỏ hàng');
      throw err;
    } finally {
      setDeletingFromCart(false);
    }
  }, [setDeletingFromCart, removeCartItem, setError, clearError]);

  /**
   * Tạo đơn hàng từ giỏ hàng
   */
  const createOrder = useCallback(async (orderData: CreateOrderRequest) => {
    try {
      setCreatingOrder(true);
      clearError();
      
      console.log('Tạo đơn hàng:', orderData);
      const order = await OrdersAPI.createOrder(orderData);
      
      // Thêm đơn hàng vào state
      addOrder(order);
      
      // Xóa giỏ hàng sau khi tạo đơn hàng thành công
      clearCart();
      
      console.log('Tạo đơn hàng thành công:', order);
      return order;
    } catch (err: any) {
      console.error('Lỗi tạo đơn hàng:', err);
      setError(err.message || 'Không thể tạo đơn hàng');
      throw err;
    } finally {
      setCreatingOrder(false);
    }
  }, [setCreatingOrder, addOrder, clearCart, setError, clearError]);

  /**
   * Lấy danh sách đơn hàng
   */
  const fetchOrders = useCallback(async (params?: OrdersQueryParams) => {
    try {
      setFetchingOrders(true);
      clearError();
      
      console.log('Lấy danh sách đơn hàng:', params);
      const ordersData = await OrdersAPI.getOrders(params);
      
      // Cập nhật state
      setOrders(ordersData.items || []);
      
      console.log('Lấy danh sách đơn hàng thành công:', ordersData);
      return ordersData;
    } catch (err: any) {
      console.error('Lỗi lấy danh sách đơn hàng:', err);
      setError(err.message || 'Không thể lấy danh sách đơn hàng');
      throw err;
    } finally {
      setFetchingOrders(false);
    }
  }, [setFetchingOrders, setOrders, setError, clearError]);

  /**
   * Lấy thông tin đơn hàng theo ID
   */
  const fetchOrderById = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      clearError();
      
      console.log('Lấy thông tin đơn hàng:', orderId);
      const order = await OrdersAPI.getOrderById(orderId);
      
      console.log('Lấy đơn hàng thành công:', order);
      return order;
    } catch (err: any) {
      console.error('Lỗi lấy đơn hàng:', err);
      setError(err.message || 'Không thể lấy thông tin đơn hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError]);

  /**
   * Refresh giỏ hàng
   */
  const refreshCart = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchCart();
    } catch (err) {
      console.error('Lỗi refresh giỏ hàng:', err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchCart]);

  /**
   * Xóa tất cả lỗi
   */
  const clearAllErrors = useCallback(() => {
    clearError();
  }, [clearError]);

  // Computed values
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const isEmpty = cartItems.length === 0;

  return {
    // State
    cart,
    cartItems,
    orders,
    error,
    refreshing,
    
    // Loading states
    isLoading,
    isAddingToCart,
    isUpdatingCart,
    isDeletingFromCart,
    isCreatingOrder,
    isFetchingOrders,
    
    // Computed values
    totalItems,
    totalPrice,
    isEmpty,
    
    // Actions
    initializeCart,
    fetchCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    createOrder,
    fetchOrders,
    fetchOrderById,
    refreshCart,
    clearAllErrors,
    clearCart
  };
};
