import React, { useState } from 'react';
import { Vehicle, Sale, StockAlert, VehicleType, User } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Settings, 
  AlertTriangle, 
  DollarSign, 
  Car, 
  Check, 
  Percent, 
  FileText,
  Sliders
} from 'lucide-react';
import { motion } from 'motion/react';

interface ReportsViewProps {
  currentUser: User;
  vehicles: Vehicle[];
  sales: Sale[];
  alerts: StockAlert[];
  onUpdateAlertThreshold: (id: string, threshold: number, isActive: boolean) => void;
}

export default function ReportsView({
  currentUser,
  vehicles,
  sales,
  alerts,
  onUpdateAlertThreshold
}: ReportsViewProps) {
  // Config state
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [tempThreshold, setTempThreshold] = useState<number>(0);
  const [tempIsActive, setTempIsActive] = useState<boolean>(true);

  // Dynamic Months aggregator for sales
  const getMonthlySalesData = () => {
    const monthsSpanish = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const aggregation: { [key: string]: { amount: number; count: number } } = {};

    // Initialize last 6 months dynamically up to current month (July 2026)
    // We'll initialize from Feb to Jul for clear visualization of seed data
    const monthsToDisplay = ['Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'];
    monthsToDisplay.forEach(m => {
      aggregation[m] = { amount: 0, count: 0 };
    });

    sales.forEach(sale => {
      const date = new Date(sale.date);
      const monthIndex = date.getMonth();
      const monthName = monthsSpanish[monthIndex];
      
      if (aggregation[monthName] !== undefined) {
        aggregation[monthName].amount += sale.salePrice;
        aggregation[monthName].count += 1;
      }
    });

    return monthsToDisplay.map(m => ({
      month: m,
      'Volumen de Ventas (€)': aggregation[m].amount,
      'Autos Vendidos': aggregation[m].count
    }));
  };

  // Dynamic categories stock aggregator
  const getStockDistributionData = () => {
    const types: VehicleType[] = ['Sedán', 'SUV', 'Pickup', 'Hatchback', 'Deportivo', 'Eléctrico'];
    
    return types.map(t => {
      const count = vehicles.filter(v => v.type === t && v.status === 'Disponible').length;
      return {
        category: t,
        'Stock Disponible': count
      };
    });
  };

  const salesChartData = getMonthlySalesData();
  const stockChartData = getStockDistributionData();

  // Calculate high-level financial ratios
  const totalRevenue = sales.reduce((acc, s) => acc + s.salePrice, 0);
  const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0;
  
  // Payment methods chart aggregation
  const getPaymentMethodsData = () => {
    const counts = { Contado: 0, Financiado: 0, Transferencia: 0 };
    sales.forEach(s => {
      if (counts[s.paymentMethod] !== undefined) {
        counts[s.paymentMethod]++;
      }
    });
    return [
      { name: 'Contado', value: counts.Contado, color: '#10b981' },
      { name: 'Financiado', value: counts.Financiado, color: '#3b82f6' },
      { name: 'Transferencia', value: counts.Transferencia, color: '#6366f1' }
    ];
  };

  const paymentData = getPaymentMethodsData();

  // Currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  // Handle saving alert updates
  const handleStartEditing = (alertItem: StockAlert) => {
    if (currentUser.role === 'VENDEDOR') {
      alert('No tienes permisos de rango gerencial para alterar alertas de stock.');
      return;
    }
    setEditingAlertId(alertItem.id);
    setTempThreshold(alertItem.threshold);
    setTempIsActive(alertItem.isActive);
  };

  const handleSaveAlert = (id: string) => {
    onUpdateAlertThreshold(id, tempThreshold, tempIsActive);
    setEditingAlertId(null);
  };

  return (
    <div className="space-y-6" id="reports-view">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="reports-kpis">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-lg">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Ticket Promedio Venta</span>
          <span className="text-xl font-bold text-white block mt-1">
            {formatCurrency(averageTicket)}
          </span>
          <p className="text-[10px] text-slate-300 mt-2 leading-relaxed">
            Valor medio obtenido por transacción cerrada.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-lg">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Ventas Totales</span>
          <span className="text-xl font-bold text-emerald-400 block mt-1">
            {formatCurrency(totalRevenue)}
          </span>
          <p className="text-[10px] text-slate-300 mt-2 font-medium leading-relaxed">
            Ingreso bruto total acumulado por el equipo comercial.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-lg">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Eficiencia Comercial</span>
          <span className="text-xl font-bold text-white block mt-1 flex items-center gap-1">
            <Percent className="w-4 h-4 text-slate-400" />
            <span>87.5%</span>
          </span>
          <p className="text-[10px] text-slate-300 mt-2 leading-relaxed">
            Porcentaje de rotación mensual sobre inventario ingresado.
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="reports-charts-row">
        
        {/* Left: Monthly sales volume chart (automatic) */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 lg:col-span-8 space-y-4 shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Reporte Mensual de Ventas</h3>
            <p className="text-[11px] text-slate-300 mt-0.5">Volumen total facturado y cantidad de transacciones por mes</p>
          </div>

          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                <Bar dataKey="Volumen de Ventas (€)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Payment Method share */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 lg:col-span-4 flex flex-col justify-between shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Métodos de Financiación</h3>
            <p className="text-[11px] text-slate-300 mt-0.5">Distribución preferencial de pagos</p>
          </div>

          <div className="h-44 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '10px', backdropFilter: 'blur(10px)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {paymentData.map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-300 font-medium">{p.name}</span>
                </div>
                <span className="font-bold text-white">{p.value} autos</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Stock Distribution & Low Stock configuration Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="reports-stock-row">
        
        {/* Left: Stock levels by category chart */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 lg:col-span-6 space-y-4 shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Distribución de Stock Real</h3>
            <p className="text-[11px] text-slate-300 mt-0.5">Nivel actual de unidades disponibles para entrega inmediata por tipo</p>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stockChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="category" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                />
                <Line type="monotone" dataKey="Stock Disponible" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Stock threshold alert configurations */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 lg:col-span-6 space-y-4 shadow-lg" id="alert-settings-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Umbrales de Stock e Alertas</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">Define los mínimos permitidos para disparar alarmas visuales</p>
            </div>
            <Sliders className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {alerts.map((alert) => {
              const isEditing = editingAlertId === alert.id;
              
              // Count available stock for display comparison
              let availableStock = 0;
              if (alert.vehicleType === 'General') {
                availableStock = vehicles.filter(v => v.status === 'Disponible').length;
              } else {
                availableStock = vehicles.filter(v => v.type === alert.vehicleType && v.status === 'Disponible').length;
              }

              const isTriggered = alert.isActive && availableStock < alert.threshold;

              return (
                <div 
                  key={alert.id}
                  className={`p-3 border rounded-xl flex items-center justify-between text-xs transition-all ${
                    isTriggered 
                      ? 'bg-amber-950/20 border-amber-500/35 text-amber-300' 
                      : 'bg-black/35 border-white/10 text-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{alert.vehicleType}</span>
                      {isTriggered && (
                        <span className="text-[8px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/20 animate-pulse uppercase">
                          Bajo Mínimo
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Stock Actual: <strong className="text-white">{availableStock}</strong></span>
                      <span>•</span>
                      <span>Umbral de Alerta: <strong className="text-white">{alert.threshold}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2 bg-slate-950/80 border border-white/15 p-1.5 rounded-lg backdrop-blur-xl">
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[8px] text-slate-500 uppercase font-bold">Mínimo</label>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={tempThreshold}
                            onChange={(e) => setTempThreshold(Number(e.target.value))}
                            className="w-12 bg-black/50 text-white border border-white/10 rounded text-center text-xs font-bold py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[8px] text-slate-500 uppercase font-bold">Alerta</label>
                          <button
                            type="button"
                            onClick={() => setTempIsActive(!tempIsActive)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              tempIsActive ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-slate-500 border border-white/5'
                            }`}
                          >
                            {tempIsActive ? 'On' : 'Off'}
                          </button>
                        </div>

                        <button
                          onClick={() => handleSaveAlert(alert.id)}
                          className="p-1.5 bg-indigo-600 hover:bg-indigo-500 border border-white/10 rounded-lg text-white flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
                          title="Guardar ajuste"
                        >
                          <Check className="w-3.5 h-3.5 font-bold" />
                        </button>
                      </div>
                    ) : (
                      currentUser.role !== 'VENDEDOR' && (
                        <button
                          onClick={() => handleStartEditing(alert)}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          Configurar
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
