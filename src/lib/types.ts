export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  category_id: string | null;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
  tags: string[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product?: Product;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
};

export type Order = {
  id: string;
  user_id: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  coupon_code: string | null;
  shipping_address: any;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
};
