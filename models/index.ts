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


