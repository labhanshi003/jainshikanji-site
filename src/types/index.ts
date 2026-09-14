export interface MenuItem {
  id: string;
  category: "Signature Drinks" | "Legendary Snacks" | "Hearty Meals";
  name: string;
  description: string;
  price: number;
  photo: string;
  available: boolean; // Admin ON/OFF toggle — added in Phase 2
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone: string;
  mapLink: string;
  hours: string;
}

export interface ContactLead {
  name: string;
  phone: string;
  email: string;
  message: string;
  submittedAt: string;
}

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
}

// ---- Phase 2: Admin Panel types ----

export interface RestaurantTable {
  id: string;
  name: string;
  area: "Indoor" | "Outdoor" | "AC Hall" | "Counter";
  seats: number;
  status: "free" | "occupied";
}

export interface StaffLogEntry {
  staffName: string;
  action: string;
  loggedAt: string;
}

export interface DashboardStats {
  totalMenuItems: number;
  activeMenuItems: number;
  totalTables: number;
  contactLeads: number;
  newsletterSubscribers: number;
  activeOrders: number;
  todaysRevenue: number;
}

// ---- Phase 3: Kitchen Screen types ----

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number; // snapshot of the menu price at order time — bill stays correct even if price changes later
  status: "pending" | "ready";
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  status: "active" | "completed";
  source: "waiter" | "qr" | "manual";
  createdAt: string;
  // ---- Phase 5.1: billing + payment + tracking ----
  subtotal: number;
  tax: number;
  total: number;
  estimatedReadyAt: string; // ISO timestamp — drives the "ready in ~N mins" countdown
  paymentMethod: "cash" | "upi";
  paymentStatus: "pending" | "paid";
}

// One row on the Kitchen Screen's aggregated view — same menu item summed
// across every active order, Petpooja-KDS style, so the kitchen cooks one
// batch instead of separate portions per table.
export interface AggregatedKOTItem {
  menuItemId: string;
  name: string;
  totalQuantity: number;
  contributingOrders: { orderId: string; tableName: string; quantity: number }[];
}
