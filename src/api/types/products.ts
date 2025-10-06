export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: string;
  stock: number;
}

export type UpdateProductPayload = CreateProductPayload;
