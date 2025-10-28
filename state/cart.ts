import { create } from 'zustand';
import { Cart, CartItem, Order } from '../models';

/**
 * Kiểu trạng thái cho Giỏ hàng (Cart)
 */
interface CartState {
  // Dữ liệu giỏ hàng
  cart: Cart | null;
  cartItems: CartItem[];
  orders: Order[];
  
  // Trạng thái tải (loading)
  isLoading: boolean;
  isAddingToCart: boolean;
  isUpdatingCart: boolean;
  isDeletingFromCart: boolean;
  isCreatingOrder: boolean;
  isFetchingOrders: boolean;
  
  // Trạng thái lỗi
  error: string | null;
  
  // Hành động cập nhật state
  setCart: (cart: Cart | null) => void;
  setCartItems: (items: CartItem[]) => void;
  addCartItem: (item: CartItem) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  removeCartItem: (itemId: string) => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  
  // Hành động cập nhật trạng thái loading
  setLoading: (loading: boolean) => void;
  setAddingToCart: (loading: boolean) => void;
  setUpdatingCart: (loading: boolean) => void;
  setDeletingFromCart: (loading: boolean) => void;
  setCreatingOrder: (loading: boolean) => void;
  setFetchingOrders: (loading: boolean) => void;
  
  // Hành động xử lý lỗi
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Giá trị tính toán từ state
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
}

/**
 * Cart Store - Zustand store cho quản lý giỏ hàng
 */
export const useCartStore = create<CartState>((set, get) => ({
  // Giá trị khởi tạo
  cart: null,
  cartItems: [],
  orders: [],
  
  // Trạng thái loading
  isLoading: false,
  isAddingToCart: false,
  isUpdatingCart: false,
  isDeletingFromCart: false,
  isCreatingOrder: false,
  isFetchingOrders: false,
  
  // Trạng thái lỗi
  error: null,
  
  // Hành động cập nhật dữ liệu giỏ hàng
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
      const existingItem = updatedItems[existingItemIndex];
      const newQuantity = existingItem.quantity + item.quantity;
      const newTotalPrice = existingItem.unitPrice * newQuantity;
      
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        totalPrice: newTotalPrice
      };
      return { cartItems: updatedItems };
    } else {
      // Thêm sản phẩm mới
      return { cartItems: [...state.cartItems, item] };
    }
  }),
  
  updateCartItem: (itemId, updates) => set((state) => ({
    cartItems: state.cartItems.map((item) => {
      if (item._id === itemId) {
        const updatedItem = { ...item, ...updates };
        // Tính lại tổng giá nếu số lượng hoặc đơn giá thay đổi
        if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
          updatedItem.totalPrice = updatedItem.unitPrice * updatedItem.quantity;
        }
        return updatedItem;
      }
      return item;
    })
  })),
  
  removeCartItem: (itemId) => set((state) => ({
    cartItems: state.cartItems.filter((item) => item._id !== itemId)
  })),
  
  setOrders: (orders) => set({ orders }),
  
  addOrder: (order) => set((state) => ({
    orders: [order, ...state.orders]
  })),
  
  // Hành động cập nhật trạng thái loading
  setLoading: (loading) => set({ isLoading: loading }),
  
  setAddingToCart: (loading) => set({ isAddingToCart: loading }),
  
  setUpdatingCart: (loading) => set({ isUpdatingCart: loading }),
  
  setDeletingFromCart: (loading) => set({ isDeletingFromCart: loading }),
  
  setCreatingOrder: (loading) => set({ isCreatingOrder: loading }),
  
  setFetchingOrders: (loading) => set({ isFetchingOrders: loading }),
  
  // Hành động lỗi
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  // Giá trị tính toán
  getTotalItems: () => {
    const state = get();
    return state.cartItems.reduce((total, item) => total + item.quantity, 0);
  },
  
  getTotalPrice: () => {
    const state = get();
    return state.cartItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
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
