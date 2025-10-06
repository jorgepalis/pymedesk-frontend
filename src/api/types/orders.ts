export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItemProduct {
  id: number;
  name: string;
  price: number;
}

export interface OrderItem {
  id: number;
  product: OrderItemProduct;
  quantity: number;
  subtotal: string;
}

export interface OrderUser {
  id: number;
  email: string;
  name: string;
}

export interface Order {
  id: number;
  user: OrderUser;
  status: OrderStatus;
  total_price: string;
  created_at: string;
  items: OrderItem[];
}

export interface CreateOrderItem {
  product_id: number;
  quantity: number;
}

export interface CreateOrderPayload {
  items: CreateOrderItem[];
}
