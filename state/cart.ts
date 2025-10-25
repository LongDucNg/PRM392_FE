import { create } from 'zustand';
import { Cart, CartItem, Order } from '../models';

/**
 * Cart State Interface
 */
interface CartState {
  // Cart data
  cart: Cart | null;
  cartItems: CartItem[];
  orders: Order[];
  
  // Loading states
  isLoading: boolean;
  isAddingToCart: boolean;
  isUpdatingCart: boolean;
  isDeletingFromCart: boolean;
  isCreatingOrder: boolean;
  isFetchingOrders: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  setCart: (cart: Cart | null) => void;
  setCartItems: (items: CartItem[]) => void;
  addCartItem: (item: CartItem) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  removeCartItem: (itemId: string) => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  
  // Loading actions
  setLoading: (loading: boolean) => void;
  setAddingToCart: (loading: boolean) => void;
  setUpdatingCart: (loading: boolean) => void;
  setDeletingFromCart: (loading: boolean) => void;
  setCreatingOrder: (loading: boolean) => void;
  setFetchingOrders: (loading: boolean) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
}

/**
 * Cart Store - Zustand store cho quản lý giỏ hàng
 */
export const useCartStore = create<CartState>((set, get) => ({
  // Initial state
  cart: null,
  cartItems: [],
  orders: [],
  
  // Loading states
  isLoading: false,
  isAddingToCart: false,
  isUpdatingCart: false,
  isDeletingFromCart: false,
  isCreatingOrder: false,
  isFetchingOrders: false,
  
  // Error state
  error: null,
  
  // Actions
  setCart: (cart) => set({ cart }),
  
  setCartItems: (items) => set({ cartItems: items }),
  
  addCartItem: (item) => set((state) => {
    const existingItemIndex = state.cartItems.findIndex(
      (existingItem) => 
        existingItem.productId === item.productId && 
        existingItem.productVariantId === item.productVariantId
    );
    
    if (existingItemIndex >= 0) {
      // Cập nhật số lượng nếu sản phẩm đã tồn tại
      const updatedItems = [...state.cartItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + item.quantity
      };
      return { cartItems: updatedItems };
    } else {
      // Thêm sản phẩm mới
      return { cartItems: [...state.cartItems, item] };
    }
  }),
  
  updateCartItem: (itemId, updates) => set((state) => ({
    cartItems: state.cartItems.map((item) =>
      item._id === itemId ? { ...item, ...updates } : item
    )
  })),
  
  removeCartItem: (itemId) => set((state) => ({
    cartItems: state.cartItems.filter((item) => item._id !== itemId)
  })),
  
  setOrders: (orders) => set({ orders }),
  
  addOrder: (order) => set((state) => ({
    orders: [order, ...state.orders]
  })),
  
  // Loading actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  setAddingToCart: (loading) => set({ isAddingToCart: loading }),
  
  setUpdatingCart: (loading) => set({ isUpdatingCart: loading }),
  
  setDeletingFromCart: (loading) => set({ isDeletingFromCart: loading }),
  
  setCreatingOrder: (loading) => set({ isCreatingOrder: loading }),
  
  setFetchingOrders: (loading) => set({ isFetchingOrders: loading }),
  
  // Error actions
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  // Computed values
  getTotalItems: () => {
    const state = get();
    return state.cartItems.reduce((total, item) => total + item.quantity, 0);
  },
  
  getTotalPrice: () => {
    const state = get();
    // Note: Cần thêm thông tin giá từ product để tính tổng tiền
    // Hiện tại chỉ trả về số lượng items
    return state.cartItems.length;
  },
  
  clearCart: () => set({
    cart: null,
    cartItems: [],
    error: null
  })
}));

/**
 * Cart Selectors - Các selector để lấy dữ liệu từ store
 */
export const cartSelectors = {
  // Lấy thông tin giỏ hàng
  getCart: () => useCartStore.getState().cart,
  
  // Lấy danh sách items trong giỏ
  getCartItems: () => useCartStore.getState().cartItems,
  
  // Lấy tổng số items
  getTotalItems: () => useCartStore.getState().getTotalItems(),
  
  // Lấy tổng giá
  getTotalPrice: () => useCartStore.getState().getTotalPrice(),
  
  // Lấy trạng thái loading
  getLoadingStates: () => {
    const state = useCartStore.getState();
    return {
      isLoading: state.isLoading,
      isAddingToCart: state.isAddingToCart,
      isUpdatingCart: state.isUpdatingCart,
      isDeletingFromCart: state.isDeletingFromCart,
      isCreatingOrder: state.isCreatingOrder,
      isFetchingOrders: state.isFetchingOrders
    };
  },
  
  // Lấy lỗi
  getError: () => useCartStore.getState().error,
  
  // Kiểm tra giỏ hàng có trống không
  isEmpty: () => useCartStore.getState().cartItems.length === 0,
  
  // Lấy danh sách đơn hàng
  getOrders: () => useCartStore.getState().orders
};
