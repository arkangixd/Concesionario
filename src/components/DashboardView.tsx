import React from 'react';
import { Vehicle, Sale, StockAlert, SystemLog, User } from '../types';
import { 
  TrendingUp, 
  Car, 
  AlertTriangle, 
  Wrench, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  FileText,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  currentUser: User;
  vehicles: Vehicle[];
  sales: Sale[];
  alerts: StockAlert[];
  logs: SystemLog[];
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ 
  currentUser, 
  vehicles, 
  sales, 
  alerts, 
  logs,
  onNavigate 
}: DashboardViewProps) {
  
  // Calculate analytics
  const totalSalesVolume = sales.reduce((acc, s) => acc + s.salePrice, 0);
  const availableCount = vehicles.filter(v => v.status === 'Disponible').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'Mantenimiento').length;
  const reservedCount = vehicles.filter(v => v.status === 'Reservado').length;

  // Check active low stock alerts
  const activeAlerts = alerts.filter(alert => {
    if (!alert.isActive) return false;
    if (alert.vehicleType === 'General') {
      const currentGeneralStock = vehicles.filter(v => v.status === 'Disponible').length;
      return currentGeneralStock < alert.threshold;
    } else {
      const currentTypeStock = vehicles.filter(v => v.type === alert.vehicleType && v.status === 'Disponible').length;
      return currentTypeStock < alert.threshold;
    }
  });

  // Get active stock counts for alerts to display
  const getStockCountForAlert = (type: string) => {
    if (type === 'General') {
      return vehicles.filter(v => v.status === 'Disponible').length;
    }
    return vehicles.filter(v => v.type === type && v.status === 'Disponible').length;
  };

  // Recent 3 sales
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Recent 4 logs
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Top Banner with user greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl relative overflow-hidden shadow-xl" id="dashboard-header">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Hola, {currentUser.name}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Bienvenido al panel de control de tu concesionario. Rol actual:{' '}
            <span className="text-emerald-400 font-semibold uppercase text-xs tracking-wider border border-white/10 bg-white/5 px-2 py-0.5 rounded ml-1">
              {currentUser.role}
            </span>
          </p>
        </div>
        <div className="flex gap-2 z-10">
          {currentUser.permissions.includes('make_sales') && (
            <button
              onClick={() => onNavigate('sales')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition text-sm flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 border border-white/10 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Nueva Venta</span>
            </button>
          )}
          {currentUser.permissions.includes('manage_inventory') && (
            <button
              onClick={() => onNavigate('inventory')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Car className="w-4 h-4" />
              <span>Inventario</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Stock Level Alerts */}
      {activeAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-950/20 border border-amber-500/20 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
          id="stock-alert-banner"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-amber-400 font-semibold text-sm">
                Alerta de Stock Crítico Detectada
              </h3>
              <p className="text-slate-300 text-xs mt-0.5">
                Hay {activeAlerts.length} categoría(s) cuyo nivel de stock de autos disponibles está por debajo del límite configurado.
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {activeAlerts.map(alert => {
              const currentStock = getStockCountForAlert(alert.vehicleType);
              return (
                <span 
                  key={alert.id}
                  className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg flex items-center gap-1"
                >
                  {alert.vehicleType === 'General' ? 'General' : alert.vehicleType}: {currentStock} / Mín. {alert.threshold}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpis">
        {/* KPI 1: Sales Amount */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform">
            <DollarSign className="w-24 h-24 text-white" />
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Monto de Ventas</span>
            <span className="text-2xl font-bold text-white tracking-tight block">
              {formatCurrency(totalSalesVolume)}
            </span>
            <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{sales.length} autos vendidos</span>
            </span>
          </div>
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Available Vehicles */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform">
            <Car className="w-24 h-24 text-white" />
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Autos Disponibles</span>
            <span className="text-2xl font-bold text-white tracking-tight block">
              {availableCount}
            </span>
            <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-0.5 animate-pulse"></span>
              <span>{reservedCount} Reservas activas</span>
            </span>
          </div>
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Under Maintenance */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform">
            <Wrench className="w-24 h-24 text-white" />
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">En Mantenimiento</span>
            <span className="text-2xl font-bold text-white tracking-tight block">
              {maintenanceCount}
            </span>
            <span className="text-amber-400 text-xs font-medium flex items-center gap-1">
              <span>Requiere atención técnica</span>
            </span>
          </div>
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-amber-400 shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Low Stock warnings */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-24 h-24 text-white" />
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Alertas de Stock</span>
            <span className="text-2xl font-bold text-white tracking-tight block">
              {activeAlerts.length}
            </span>
            <span className="text-xs font-medium block">
              {activeAlerts.length > 0 ? (
                <span className="text-amber-400">Nivel de stock bajo</span>
              ) : (
                <span className="text-emerald-400">Stock saludable</span>
              )}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${
            activeAlerts.length > 0 
              ? 'bg-amber-500/10 text-amber-400' 
              : 'bg-white/5 text-emerald-400'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Detailed Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-details">
        
        {/* Left: Recent Sales */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 lg:col-span-7 shadow-lg" id="dashboard-recent-sales">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Ventas Recientes</h2>
              <p className="text-xs text-slate-400 mt-0.5">Últimas transacciones completadas</p>
            </div>
            <button 
              onClick={() => onNavigate('reports')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver todos los reportes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div 
                key={sale.id}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{sale.vehicleName}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>Vendedor: {sale.sellerName}</span>
                      <span>•</span>
                      <span>{sale.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">
                    {formatCurrency(sale.salePrice)}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-white/5 border border-white/10 text-slate-300 rounded">
                    {sale.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                No se han registrado ventas recientemente.
              </div>
            )}
          </div>
        </div>

        {/* Right: Security Log and System status */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 lg:col-span-5 flex flex-col justify-between shadow-lg" id="dashboard-system-logs">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">Actividad Reciente</h2>
                <p className="text-xs text-slate-400 mt-0.5">Bitácora de seguridad y auditoría</p>
              </div>
              <ShieldAlert className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3.5">
              {recentLogs.map((log) => {
                let badgeColor = 'bg-white/5 text-slate-400';
                if (log.category === 'Inventario') badgeColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                if (log.category === 'Ventas') badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                if (log.category === 'Usuarios') badgeColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';

                return (
                  <div key={log.id} className="text-xs border-l-2 border-white/10 pl-3 py-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{log.action}</span>
                      <span className="text-[9px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-2 pt-0.5 text-[9px]">
                      <span className="text-slate-400">Por: {log.userName}</span>
                      <span className="text-slate-600">•</span>
                      <span className={`px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider text-[8px] ${badgeColor}`}>
                        {log.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>Base de Datos: <strong className="text-emerald-400 font-semibold">Local Storage</strong></span>
            <span>Estado: <strong className="text-emerald-400 font-semibold">Activo</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}
