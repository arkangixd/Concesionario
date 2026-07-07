import React, { useState } from 'react';
import { Vehicle, Sale, User } from '../types';
import { 
  TrendingUp, 
  Search, 
  DollarSign, 
  User as UserIcon, 
  FileText, 
  Plus, 
  X, 
  CreditCard, 
  Check, 
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SalesViewProps {
  currentUser: User;
  vehicles: Vehicle[];
  sales: Sale[];
  onRegisterSale: (sale: Omit<Sale, 'id' | 'sellerId' | 'sellerName' | 'date'>) => void;
}

export default function SalesView({
  currentUser,
  vehicles,
  sales,
  onRegisterSale
}: SalesViewProps) {
  // Navigation & UI States
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('Todos');

  // New Sale Form States
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [salePrice, setSalePrice] = useState(0);
  const [buyerName, setBuyerName] = useState('');
  const [buyerDni, setBuyerDni] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Contado' | 'Financiado' | 'Transferencia'>('Contado');

  // Filter vehicles that can actually be sold (Available or Reserved)
  const sellableVehicles = vehicles.filter(v => v.status === 'Disponible' || v.status === 'Reservado');

  // Update sale price automatically when a vehicle is selected
  const handleVehicleChange = (id: string) => {
    setSelectedVehicleId(id);
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
      setSalePrice(vehicle.price);
    } else {
      setSalePrice(0);
    }
  };

  // Submit sale form
  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !buyerName || !buyerDni || !buyerPhone || !buyerEmail) {
      alert('Por favor, rellene todos los campos obligatorios.');
      return;
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    if (!vehicle) return;

    onRegisterSale({
      vehicleId: selectedVehicleId,
      vehicleName: `${vehicle.brand} ${vehicle.model} (${vehicle.year})`,
      salePrice: Number(salePrice),
      buyerName,
      buyerDni: buyerDni.toUpperCase(),
      buyerPhone,
      buyerEmail,
      paymentMethod
    });

    // Reset Form
    setSelectedVehicleId('');
    setSalePrice(0);
    setBuyerName('');
    setBuyerDni('');
    setBuyerPhone('');
    setBuyerEmail('');
    setPaymentMethod('Contado');
    setIsNewSaleOpen(false);
  };

  // Filter sales list
  const filteredSales = sales.filter(s => {
    const matchesSearch = 
      s.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.buyerDni.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPayment = paymentFilter === 'Todos' || s.paymentMethod === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  // Currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6" id="sales-view">
      
      {/* Header Area */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-4 shadow-lg" id="sales-header">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Módulo de Ventas e Facturación</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Registra nuevas ventas y mantén un control de auditoría de transacciones comerciales.
            </p>
          </div>

          {currentUser.permissions.includes('make_sales') && (
            <button
              onClick={() => {
                if (sellableVehicles.length === 0) {
                  alert('No hay autos disponibles o reservados en el inventario para vender.');
                  return;
                }
                setIsNewSaleOpen(true);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition flex items-center gap-1.5 self-stretch md:self-auto justify-center border border-white/10 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Venta</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Search bar */}
          <div className="relative sm:col-span-8">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar venta por cliente, auto o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/35 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm font-medium"
            />
          </div>

          {/* Payment filter */}
          <div className="relative sm:col-span-4 flex items-center">
            <CreditCard className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-black/35 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 text-xs appearance-none cursor-pointer font-medium"
            >
              <option value="Todos" className="bg-slate-900 text-white">Método de Pago: Todos</option>
              <option value="Contado" className="bg-slate-900 text-white">Contado</option>
              <option value="Financiado" className="bg-slate-900 text-white">Financiado</option>
              <option value="Transferencia" className="bg-slate-900 text-white">Transferencia</option>
            </select>
            <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Sales Grid/Table */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg" id="sales-history-table">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Historial de Transacciones</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold text-[10px] bg-black/20">
                <th className="px-6 py-3.5">Código Venta</th>
                <th className="px-6 py-3.5">Vehículo</th>
                <th className="px-6 py-3.5">Comprador</th>
                <th className="px-6 py-3.5">Fecha</th>
                <th className="px-6 py-3.5">Vendedor</th>
                <th className="px-6 py-3.5">Método de Pago</th>
                <th className="px-6 py-3.5 text-right">Monto Neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-mono text-slate-400 uppercase font-semibold">
                    {sale.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {sale.vehicleName}
                  </td>
                  <td className="px-6 py-4 space-y-0.5">
                    <span className="block font-medium text-slate-200">{sale.buyerName}</span>
                    <span className="block text-[10px] text-slate-500 font-mono uppercase">{sale.buyerDni}</span>
                  </td>
                  <td className="px-6 py-4">
                    {sale.date}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-300">
                    {sale.sellerName}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px] ${
                      sale.paymentMethod === 'Contado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      sale.paymentMethod === 'Financiado' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-white text-sm">
                    {formatCurrency(sale.salePrice)}
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No se encontraron transacciones en la bitácora comercial.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale Form Modal */}
      <AnimatePresence>
        {isNewSaleOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950/90 border border-white/15 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] backdrop-blur-2xl"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Registrar Venta Autorizada</span>
                </h3>
                <button 
                  onClick={() => setIsNewSaleOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitSale} className="p-6 overflow-y-auto space-y-4 flex-1">
                
                {/* Step 1: Vehicle selection */}
                <div className="p-4 bg-black/35 border border-white/10 rounded-xl space-y-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">1. Selección de Vehículo</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Elegir Auto del Inventario *</label>
                      <div className="relative flex items-center">
                        <select
                          required
                          value={selectedVehicleId}
                          onChange={(e) => handleVehicleChange(e.target.value)}
                          className="w-full bg-black/35 border border-white/10 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-slate-900 text-white">-- Seleccionar Vehículo --</option>
                          {sellableVehicles.map(v => (
                            <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                              {v.brand} {v.model} ({v.year}) - {formatCurrency(v.price)} [{v.status}]
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 rotate-90 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Precio Acordado de Venta (€) *</label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="number"
                          required
                          min={0}
                          value={salePrice}
                          onChange={(e) => setSalePrice(Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 bg-black/35 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Buyer Details */}
                <div className="p-4 bg-black/35 border border-white/10 rounded-xl space-y-3.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">2. Datos Fiscales del Comprador</span>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre Completo o Razón Social *</label>
                    <div className="relative">
                      <UserIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Ej. Juan Pérez de la Vega"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-black/35 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">NIF / NIE / DNI Comprador *</label>
                      <div className="relative">
                        <FileText className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="Ej. 12345678X"
                          value={buyerDni}
                          onChange={(e) => setBuyerDni(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-black/35 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 text-xs uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono Móvil *</label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="tel"
                          required
                          placeholder="Ej. +34 600 123 456"
                          value={buyerPhone}
                          onChange={(e) => setBuyerPhone(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-black/35 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico *</label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="Ej. comprador@correo.com"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-black/35 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3: Payment details */}
                <div className="p-4 bg-black/35 border border-white/10 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">3. Condiciones Comerciales</span>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Método de Pago *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Contado', 'Financiado', 'Transferencia'] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 px-3 border rounded-xl text-[11px] font-semibold transition text-center flex items-center justify-center gap-1 cursor-pointer ${
                            paymentMethod === m
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                              : 'bg-black/20 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {paymentMethod === m && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                          <span>{m}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsNewSaleOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-lg border border-white/10 cursor-pointer"
                  >
                    <span>Completar Facturación</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
