export type UserRole = 'ADMIN' | 'GERENTE' | 'VENDEDOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  active: boolean;
  avatarColor: string;
}

export type VehicleStatus = 'Disponible' | 'Reservado' | 'Mantenimiento' | 'Vendido';
export type VehicleType = 'Sedán' | 'SUV' | 'Pickup' | 'Hatchback' | 'Deportivo' | 'Eléctrico';

export interface HistoryEvent {
  id: string;
  date: string;
  type: 'Mantenimiento' | 'Precio' | 'Inspección' | 'Estado' | 'Venta' | 'Nota';
  title: string;
  description: string;
  cost?: number;
  performedBy: string;
}

export interface Vehicle {
  id: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  originalPrice: number; // For tracking price history
  mileage: number;
  color: string;
  transmission: 'Automático' | 'Manual';
  fuel: 'Gasolina' | 'Diésel' | 'Eléctrico' | 'Híbrido';
  type: VehicleType;
  status: VehicleStatus;
  image: string;
  createdAt: string;
  history: HistoryEvent[];
}

export interface Sale {
  id: string;
  vehicleId: string;
  vehicleName: string;
  salePrice: number;
  sellerId: string;
  sellerName: string;
  buyerName: string;
  buyerDni: string;
  buyerPhone: string;
  buyerEmail: string;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Contado' | 'Financiado' | 'Transferencia';
}

export interface StockAlert {
  id: string;
  vehicleType: VehicleType | 'General';
  threshold: number;
  currentStock: number;
  isActive: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  category: 'Inventario' | 'Ventas' | 'Usuarios' | 'Sistema';
}
