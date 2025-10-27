export type Role = 'admin' | 'staff' | 'customer';

export type User = {
  id: string;
  email: string;
  name?: string;
  role: Role;
};

export type AuthCredentials = {
  email: string; // This will be used as identifier (can be email or phone)
  password: string;
};

export type AuthToken = string;

export type AuthResponse = {
  user: User;
  token: AuthToken;
};

export type RegisterInput = {
  phone?: string; // số điện thoại
  email?: string; // email
  password: string;
  name?: string;
};

// Category interfaces
export type Category = {
  _id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoriesResponse = {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  items: Category[];
};

export type CategoriesQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    isActive?: boolean;
  };
};

// Cart interfaces
export type Cart = {
  _id: string;
  userId: string;
  items?: CartItem[]; // Optional items array
  quantity?: number; // Total quantity of items in cart
  totalPrice?: number; // Total price of all items
  isActive?: boolean; // Whether cart is active
  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  _id: string;
  cartId: string;
  productId: string;
  productVariantId: string;
  quantity: number;
  basePrice?: number; // Price from API (before conversion to unitPrice)
  unitPrice: number; // Calculated price per unit
  totalPrice: number; // Total price for this item
  createdAt: string;
  updatedAt: string;
  // Optional populated fields
  productName?: string;
  productCode?: string;
  variant?: {
    variant: string;
    value: string;
  };
};

export type AddToCartRequest = {
  productId: string;
  productVariantId: string;
  quantity: number;
};

export type UpdateCartItemRequest = {
  productId: string;
  productVariantId: string;
  quantity: number;
  cartItemId: string;
};

// Order interfaces
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'cash_on_delivery' | 'credit_card' | 'bank_transfer' | 'qr_code';

export type OrderItem = {
  productId: string;
  productVariantId: string;
  basePrice: number;
  quantity: number;
  totalPrice: number;
};

export type Order = {
  _id: string;
  userId: string;
  totalPrice: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingPhone: string;
  shippingAddress: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type CreateOrderRequest = {
  shippingPhone: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  note?: string;
  selectedItemIds?: string[]; // IDs của các cart items được chọn để đặt hàng
};

export type OrdersQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
};

export type OrdersResponse = {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  items: Order[];
};


