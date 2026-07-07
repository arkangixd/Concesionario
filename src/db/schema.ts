import { pgTable, text, integer, boolean, timestamp, doublePrecision, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').unique(), // Firebase Auth UID (if linked via Google Sign-In)
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull(), // 'ADMIN' | 'GERENTE' | 'VENDEDOR'
  permissions: jsonb('permissions').$type<string[]>().notNull(),
  active: boolean('active').default(true).notNull(),
  avatarColor: text('avatar_color').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const vehicles = pgTable('vehicles', {
  id: text('id').primaryKey(),
  vin: text('vin').notNull().unique(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  price: doublePrecision('price').notNull(),
  originalPrice: doublePrecision('original_price').notNull(),
  mileage: integer('mileage').notNull(),
  color: text('color').notNull(),
  transmission: text('transmission').notNull(), // 'Automático' | 'Manual'
  fuel: text('fuel').notNull(), // 'Gasolina' | 'Diésel' | 'Eléctrico' | 'Híbrido'
  type: text('type').notNull(), // VehicleType
  status: text('status').notNull(), // VehicleStatus
  image: text('image').notNull(),
  createdAt: text('created_at').notNull() // Storing ISO timestamp as text for consistency with UI
});

export const historyEvents = pgTable('history_events', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(),
  type: text('type').notNull(), // 'Mantenimiento' | 'Precio' | 'Inspección' | 'Estado' | 'Venta' | 'Nota'
  title: text('title').notNull(),
  description: text('description').notNull(),
  cost: doublePrecision('cost'),
  performedBy: text('performed_by').notNull()
});

export const sales = pgTable('sales', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull(), // Keep as text, don't necessarily cascade delete to preserve history
  vehicleName: text('vehicle_name').notNull(),
  salePrice: doublePrecision('sale_price').notNull(),
  sellerId: text('seller_id').notNull(),
  sellerName: text('seller_name').notNull(),
  buyerName: text('buyer_name').notNull(),
  buyerDni: text('buyer_dni').notNull(),
  buyerPhone: text('buyer_phone').notNull(),
  buyerEmail: text('buyer_email').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  paymentMethod: text('payment_method').notNull() // 'Contado' | 'Financiado' | 'Transferencia'
});

export const stockAlerts = pgTable('stock_alerts', {
  id: text('id').primaryKey(),
  vehicleType: text('vehicle_type').notNull(), // VehicleType | 'General'
  threshold: integer('threshold').notNull(),
  currentStock: integer('current_stock').notNull(),
  isActive: boolean('is_active').default(true).notNull()
});

export const systemLogs = pgTable('system_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  action: text('action').notNull(),
  details: text('details').notNull(),
  category: text('category').notNull() // 'Inventario' | 'Ventas' | 'Usuarios' | 'Sistema'
});
