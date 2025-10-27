import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import {
  AddToCartRequest,
  CartItem,
  CreateOrderRequest,
  OrdersQueryParams,
  UpdateCartItemRequest
} from '../models';
import { CartAPI, CartItemsAPI, CartItemsService, OrdersAPI } from '../services/cartAPI';
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
      
      // Fetch cart
      const cartData = await CartAPI.getMyCart();
      console.log('Cart data received:', cartData);
      setCart(cartData);
      
      // Get cart items from cart data instead of separate API call
      // API returns { data: { items: [...], ... } } or { items: [...] } or items directly
      let cartItemsData: CartItem[] = [];
      
      // Cast cartData to any to handle different API response formats
      const anyCartData: any = cartData;
      
      if (anyCartData?.items && Array.isArray(anyCartData.items)) {
        // Items are in cart.items
        cartItemsData = anyCartData.items;
      } else if (anyCartData?.data?.items && Array.isArray(anyCartData.data.items)) {
        // Items are in cart.data.items
        cartItemsData = anyCartData.data.items;
      } else {
        // Try to fetch from separate endpoint as fallback
        try {
          cartItemsData = await CartItemsService.getMyCartItems();
          console.log('Cart items from separate API:', cartItemsData);
        } catch (fallbackError: any) {
          console.warn('Separate cart items API failed, using cart items:', fallbackError);
          // Return empty array if both fail
          cartItemsData = [];
        }
      }
      
      // Convert $numberDecimal to number if needed and handle API response format
      cartItemsData = cartItemsData.map((item: any) => {
        // API returns basePrice instead of unitPrice
        const unitPrice = typeof item.unitPrice === 'object' && item.unitPrice?.$numberDecimal
          ? parseFloat(item.unitPrice.$numberDecimal)
          : item.unitPrice || item.basePrice || 0;
        
        const totalPrice = typeof item.totalPrice === 'object' && item.totalPrice?.$numberDecimal
          ? parseFloat(item.totalPrice.$numberDecimal)
          : item.totalPrice || (unitPrice * (item.quantity || 1));
        
        return {
          ...item,
          unitPrice: unitPrice,
          totalPrice: totalPrice
        };
      });
      
      // Group items by productId and productVariantId to merge duplicates
      const groupedItems = cartItemsData.reduce((acc: any[], item: any) => {
        const existingItem = acc.find(existing => 
          existing.productId === item.productId && 
          existing.productVariantId === item.productVariantId
        );
        
        if (existingItem) {
          // Merge quantities and update total price
          existingItem.quantity += item.quantity;
          existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
        } else {
          // Add new item
          acc.push(item);
        }
        
        return acc;
      }, []);
      
      console.log('Cart items after processing and grouping:', groupedItems);
      setCartItems(groupedItems);
      
      console.log('Lấy giỏ hàng thành công:', groupedItems.length, 'items');
    } catch (err: any) {
      console.error('Lỗi lấy giỏ hàng:', err);
      setError(err.message || 'Không thể lấy thông tin giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setCart, setCartItems, setError, clearError]);

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  const addToCart = useCallback(async (data: AddToCartRequest) => {
    setAddingToCart(true);
    clearError();
    
    try {
      // Validate request data
      if (!data.productId || !data.productVariantId || !data.quantity) {
        const errorMsg = 'Dữ liệu sản phẩm không hợp lệ';
        console.error('Validation error:', errorMsg, data);
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (data.quantity <= 0) {
        const errorMsg = 'Số lượng phải lớn hơn 0';
        console.error('Validation error:', errorMsg, data);
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Thêm sản phẩm vào giỏ hàng:', {
        productId: data.productId,
        productVariantId: data.productVariantId,
        quantity: data.quantity
      });
      
      // Try API first
      let cartItem: CartItem;
      try {
        cartItem = await CartItemsAPI.addToCart(data);
      } catch (apiError: any) {
        console.warn('API failed, using local storage fallback:', apiError);
        
        // Fallback: Save to local storage
        cartItem = {
          _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          cartId: 'local_cart',
          productId: data.productId,
          productVariantId: data.productVariantId,
          quantity: data.quantity,
          unitPrice: 0, // Default price for local storage
          totalPrice: 0, // Default price for local storage
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        try {
          // Save to local storage
          await AsyncStorage.setItem('local_cart_items', JSON.stringify([cartItem]));
        } catch (storageError) {
          // If local storage also fails, throw error
          console.error('Local storage failed:', storageError);
          setError('Không thể lưu sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
          throw new Error('Không thể lưu sản phẩm vào giỏ hàng');
        }
      }
      
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
  const updateCartItemQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    try {
      setUpdatingCart(true);
      clearError();
      
      // Find the cart item to get productId and productVariantId
      const cartItem = cartItems.find(item => item._id === itemId);
      
      if (!cartItem) {
        throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
      }
      
      const data: UpdateCartItemRequest = {
        cartItemId: itemId,
        productId: cartItem.productId,
        productVariantId: cartItem.productVariantId,
        quantity: newQuantity
      };
      
      console.log('Cập nhật sản phẩm trong giỏ hàng:', data);
      const updatedItem = await CartItemsAPI.updateCartItem(data);
      
      // Cập nhật state
      updateCartItem(itemId, {
        quantity: newQuantity
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
  }, [setUpdatingCart, updateCartItem, setError, clearError, cartItems]);

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
      
      // Không xóa giỏ hàng vì user có thể muốn mua thêm
      // Backend sẽ quản lý việc giảm số lượng sản phẩm trong giỏ hàng
      // clearCart(); // Comment out để giữ lại giỏ hàng
      
      console.log('Tạo đơn hàng thành công:', order);
      return order;
    } catch (err: any) {
      console.error('Lỗi tạo đơn hàng:', err);
      setError(err.message || 'Không thể tạo đơn hàng');
      throw err;
    } finally {
      setCreatingOrder(false);
    }
  }, [setCreatingOrder, addOrder, setError, clearError]);

  /**
   * Lấy danh sách đơn hàng
   */
  const fetchOrders = useCallback(async (params?: OrdersQueryParams) => {
    try {
      setFetchingOrders(true);
      clearError();
      
      console.log('Lấy danh sách đơn hàng:', params);
      const ordersData = await OrdersAPI.getOrders(params);
      
      console.log('OrdersData structure:', ordersData);
      console.log('OrdersData.items:', ordersData.items);
      console.log('OrdersData.meta:', ordersData.meta);
      
      // Cập nhật state
      const orderItems = ordersData.items || [];
      console.log('Setting orders with items:', orderItems);
      setOrders(orderItems);
      
      console.log('Lấy danh sách đơn hàng thành công:', orderItems.length, 'orders');
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

  /**
   * Xóa toàn bộ giỏ hàng (cả trên server và local)
   */
  const clearAllCart = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      // Xóa tất cả items trên server
      if (cartItems.length > 0) {
        const itemIds = cartItems.map(item => item._id);
        await CartItemsAPI.clearAllCartItems(itemIds);
      }
      
      // Xóa local storage nếu có
      try {
        await AsyncStorage.removeItem('local_cart_items');
      } catch (storageError) {
        console.warn('Lỗi xóa local storage:', storageError);
      }
      
      // Xóa state
      clearCart();
      
      console.log('Xóa toàn bộ giỏ hàng thành công');
    } catch (err: any) {
      console.error('Lỗi xóa toàn bộ giỏ hàng:', err);
      setError(err.message || 'Không thể xóa toàn bộ giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, clearCart, cartItems, setError]);

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
    clearCart,
    clearAllCart
  };
};
