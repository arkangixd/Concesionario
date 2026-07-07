import React, { useState } from 'react';
import { Vehicle, VehicleStatus, VehicleType, HistoryEvent, User } from '../types';
import { 
  Car, 
  Search, 
  Plus, 
  Filter, 
  Clock, 
  Wrench, 
  TrendingUp, 
  CheckCircle, 
  FileText, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  DollarSign,
  Layers,
  MapPin,
  X,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryViewProps {
  currentUser: User;
  vehicles: Vehicle[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'history'>) => void;
  onUpdateVehicleStatus: (id: string, status: VehicleStatus) => void;
  onAddHistoryEvent: (vehicleId: string, event: Omit<HistoryEvent, 'id' | 'date' | 'performedBy'>) => void;
  onDeleteVehicle: (id: string) => void;
}

export default function InventoryView({
  currentUser,
  vehicles,
  onAddVehicle,
  onUpdateVehicleStatus,
  onAddHistoryEvent,
  onDeleteVehicle
}: InventoryViewProps) {
  // Navigation & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  
  // Modals & Detailed View State
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddHistoryOpen, setIsAddHistoryOpen] = useState(false);

  // Add Vehicle Form State
  const [vin, setVin] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2025);
  const [price, setPrice] = useState(30000);
  const [mileage, setMileage] = useState(0);
  const [color, setColor] = useState('');
  const [transmission, setTransmission] = useState<'Automático' | 'Manual'>('Automático');
  const [fuel, setFuel] = useState<'Gasolina' | 'Diésel' | 'Eléctrico' | 'Híbrido'>('Gasolina');
  const [type, setType] = useState<VehicleType>('Sedán');
  const [status, setStatus] = useState<VehicleStatus>('Disponible');
  const [image, setImage] = useState('');

  // Add History Event Form State
  const [histType, setHistType] = useState<HistoryEvent['type']>('Mantenimiento');
  const [histTitle, setHistTitle] = useState('');
  const [histDescription, setHistDescription] = useState('');
  const [histCost, setHistCost] = useState('');

  // Filtering vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'Todos' || v.type === selectedType;
    const matchesStatus = selectedStatus === 'Todos' || v.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Unique types and statuses for filters
  const vehicleTypes: VehicleType[] = ['Sedán', 'SUV', 'Pickup', 'Hatchback', 'Deportivo', 'Eléctrico'];
  const vehicleStatuses: VehicleStatus[] = ['Disponible', 'Reservado', 'Mantenimiento', 'Vendido'];

  // Handle vehicle submission
  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !vin || !color) return;

    // Use solid fallbacks for images if empty
    const finalImage = image.trim() || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=600&auto=format&fit=crop&q=80';

    onAddVehicle({
      vin: vin.toUpperCase(),
      brand,
      model,
      year: Number(year),
      price: Number(price),
      originalPrice: Number(price),
      mileage: Number(mileage),
      color,
      transmission,
      fuel,
      type,
      status,
      image: finalImage
    });

    // Reset Form
    setVin('');
    setBrand('');
    setModel('');
    setYear(2025);
    setPrice(30000);
    setMileage(0);
    setColor('');
    setImage('');
    setIsAddVehicleOpen(false);
  };

  // Handle history event submission
  const handleAddHistorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !histTitle || !histDescription) return;

    onAddHistoryEvent(selectedVehicle.id, {
      type: histType,
      title: histTitle,
      description: histDescription,
      cost: histCost ? Number(histCost) : undefined
    });

    // Sync selected vehicle details with updated store data
    const updatedVehicle = vehicles.find(v => v.id === selectedVehicle.id);
    if (updatedVehicle) {
      // Temporarily mock update local selection context to prevent needing to re-open modal
      setSelectedVehicle({
        ...updatedVehicle,
        history: [
          ...updatedVehicle.history,
          {
            id: Math.random().toString(),
            date: new Date().toISOString().split('T')[0],
            type: histType,
            title: histTitle,
            description: histDescription,
            cost: histCost ? Number(histCost) : undefined,
            performedBy: currentUser.name
          }
        ]
      });
    }

    // Reset Form
    setHistTitle('');
    setHistDescription('');
    setHistCost('');
    setIsAddHistoryOpen(false);
  };

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  // History type icon resolver
  const getHistoryIcon = (type: HistoryEvent['type']) => {
    switch (type) {
      case 'Mantenimiento':
        return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'Precio':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'Inspección':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'Estado':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'Venta':
        return <DollarSign className="w-4 h-4 text-teal-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getHistoryBadgeClass = (type: HistoryEvent['type']) => {
    switch (type) {
      case 'Mantenimiento': return 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
      case 'Precio': return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
      case 'Inspección': return 'bg-blue-500/10 text-blue-300 border border-blue-500/20';
      case 'Estado': return 'bg-purple-500/10 text-purple-300 border border-purple-500/20';
      case 'Venta': return 'bg-teal-500/10 text-teal-300 border border-teal-500/20';
      default: return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6" id="inventory-view">
      
      {/* Search and Filters Section */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-4 shadow-lg" id="inventory-filters">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-400" />
              <span>Inventario de Vehículos</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Administración de stock y consulta de historiales individuales ({filteredVehicles.length} de {vehicles.length} autos)
            </p>
          </div>

          {currentUser.permissions.includes('manage_inventory') && (
            <button
              onClick={() => setIsAddVehicleOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition flex items-center gap-1.5 self-stretch md:self-auto justify-center cursor-pointer border border-white/10 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Vehículo</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search bar */}
          <div className="relative sm:col-span-5">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo o VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/35 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm font-medium"
            />
          </div>

          {/* Type filter */}
          <div className="relative sm:col-span-3 flex items-center">
            <Filter className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-black/35 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 text-xs appearance-none cursor-pointer font-medium"
            >
              <option value="Todos" className="bg-slate-900 text-white">Tipo: Todos</option>
              {vehicleTypes.map(t => (
                <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
              ))}
            </select>
            <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 rotate-90 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative sm:col-span-3 flex items-center">
            <Layers className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-black/35 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 text-xs appearance-none cursor-pointer font-medium"
            >
              <option value="Todos" className="bg-slate-900 text-white">Estado: Todos</option>
              {vehicleStatuses.map(s => (
                <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
              ))}
            </select>
            <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 rotate-90 pointer-events-none" />
          </div>

          {/* Reset filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('Todos');
              setSelectedStatus('Todos');
            }}
            className="sm:col-span-1 px-2.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition text-xs font-semibold text-center cursor-pointer"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="vehicles-grid">
        {filteredVehicles.map((vehicle) => {
          // Status classes
          let statusBadgeClass = '';
          switch (vehicle.status) {
            case 'Disponible':
              statusBadgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
              break;
            case 'Reservado':
              statusBadgeClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
              break;
            case 'Mantenimiento':
              statusBadgeClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
              break;
            case 'Vendido':
              statusBadgeClass = 'bg-white/5 text-slate-400 border border-white/5';
              break;
          }

          return (
            <motion.div
              key={vehicle.id}
              layoutId={`vehicle-card-${vehicle.id}`}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-all duration-300 relative shadow-lg backdrop-blur-xl"
            >
              {/* Image & Header */}
              <div className="relative h-44 overflow-hidden bg-black/40">
                <img
                  src={vehicle.image}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${statusBadgeClass} backdrop-blur-md`}>
                    {vehicle.status}
                  </span>
                </div>

                {/* Year tag */}
                <div className="absolute top-3 right-3 bg-black/60 border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md">
                  {vehicle.year}
                </div>

                {/* Brand & Model overlay on bottom of image */}
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">{vehicle.brand}</span>
                  <h3 className="text-sm font-bold text-white tracking-tight mt-0.5 group-hover:text-emerald-300 transition-colors">{vehicle.model}</h3>
                </div>
              </div>

              {/* Specifications Area */}
              <div className="p-4 space-y-3.5">
                <div className="grid grid-cols-2 gap-3 text-xs border-b border-white/10 pb-3">
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold uppercase block">Kilometraje</span>
                    <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      {vehicle.mileage.toLocaleString('es-ES')} km
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold uppercase block">Transmisión</span>
                    <span className="text-slate-200 font-semibold block mt-0.5">{vehicle.transmission}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold uppercase block">Combustible</span>
                    <span className="text-slate-200 font-semibold block mt-0.5">{vehicle.fuel}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold uppercase block">VIN</span>
                    <span className="text-slate-300 font-mono text-[10px] block mt-1 truncate" title={vehicle.vin}>
                      {vehicle.vin}
                    </span>
                  </div>
                </div>

                {/* Cost and Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Precio de Lista</span>
                    <span className="text-base font-bold text-white">
                      {formatCurrency(vehicle.price)}
                    </span>
                  </div>
                  
                  {/* Dynamic Action Buttons */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSelectedVehicle(vehicle)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white rounded-lg border border-white/10 flex items-center gap-1 transition cursor-pointer"
                      title="Ver Historial del Auto"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      <span>Historial ({vehicle.history.length})</span>
                    </button>
                    
                    {currentUser.permissions.includes('manage_inventory') && (
                      <button
                        onClick={() => {
                          if (confirm('¿Estás seguro de que deseas eliminar este vehículo permanentemente?')) {
                            onDeleteVehicle(vehicle.id);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                        title="Eliminar auto del sistema"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredVehicles.length === 0 && (
          <div className="col-span-full py-16 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-6 backdrop-blur-md">
            <Car className="w-12 h-12 text-slate-400 mb-3" />
            <h3 className="text-white font-bold text-sm">No se encontraron vehículos</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">
              Prueba cambiando los filtros de búsqueda, categorías o ingresa un nuevo auto al concesionario.
            </p>
          </div>
        )}
      </div>

      {/* Vehicle Add Modal */}
      <AnimatePresence>
        {isAddVehicleOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950/90 border border-white/15 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] backdrop-blur-2xl"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-white text-base">Registrar Nuevo Vehículo</h3>
                <button 
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddVehicleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Marca *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Toyota, Tesla, Ford"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Modelo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. RAV4, Model Y, Mustang"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Número de VIN (17 caracteres) *</label>
                    <input
                      type="text"
                      required
                      maxLength={17}
                      minLength={17}
                      placeholder="Ej. JTDKN3DU1H4018247"
                      value={vin}
                      onChange={(e) => setVin(e.target.value)}
                      className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 font-mono uppercase text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Año *</label>
                    <input
                      type="number"
                      required
                      min={1990}
                      max={2027}
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Precio (€) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Kilometraje (km) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={mileage}
                      onChange={(e) => setMileage(Number(e.target.value))}
                      className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Color Exterior *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Rojo Nardo, Gris Grafito"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Tipo de Vehículo *</label>
                    <div className="relative flex items-center">
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as VehicleType)}
                        className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 text-sm appearance-none cursor-pointer"
                      >
                        {vehicleTypes.map(t => (
                          <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
                        ))}
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Transmisión *</label>
                    <div className="relative flex items-center">
                      <select
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value as 'Automático' | 'Manual')}
                        className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 text-sm appearance-none cursor-pointer"
                      >
                        <option value="Automático" className="bg-slate-900 text-white">Automático</option>
                        <option value="Manual" className="bg-slate-900 text-white">Manual</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Combustible *</label>
                    <div className="relative flex items-center">
                      <select
                        value={fuel}
                        onChange={(e) => setFuel(e.target.value as any)}
                        className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 text-sm appearance-none cursor-pointer"
                      >
                        <option value="Gasolina" className="bg-slate-900 text-white">Gasolina</option>
                        <option value="Diésel" className="bg-slate-900 text-white">Diésel</option>
                        <option value="Eléctrico" className="bg-slate-900 text-white">Eléctrico</option>
                        <option value="Híbrido" className="bg-slate-900 text-white">Híbrido</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Enlace de Imagen del Auto (URL)</label>
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/auto.jpg (Dejar en blanco para usar foto por defecto)"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddVehicleOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition border border-white/10 cursor-pointer"
                  >
                    Guardar Auto en Inventario
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INDEPENDENT VEHICLE HISTORY SIDE PANEL / OVERLAY */}
      <AnimatePresence>
        {selectedVehicle && (
          <div 
            onClick={() => {
              setSelectedVehicle(null);
              setIsAddHistoryOpen(false);
            }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-end z-50 p-0 sm:p-4 cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 200 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-slate-950/90 border-l border-white/15 w-full max-w-lg h-full sm:h-[calc(100vh-2rem)] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl cursor-default"
              id="history-side-panel"
            >
              {/* Header */}
              <div className="flex justify-between items-start px-6 py-5 border-b border-white/10 relative bg-white/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">{selectedVehicle.brand}</span>
                  <h3 className="font-bold text-white text-base tracking-tight mt-0.5">
                    {selectedVehicle.model} ({selectedVehicle.year})
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
                    ID Historial: {selectedVehicle.vin}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedVehicle(null);
                    setIsAddHistoryOpen(false);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Vehicle Mini Status Overview */}
              <div className="grid grid-cols-3 gap-2 px-6 py-3 bg-black/20 border-b border-white/10 text-[11px] text-slate-300">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Estado</span>
                  <span className="text-white font-medium block mt-0.5">{selectedVehicle.status}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Precio Lista</span>
                  <span className="text-white font-medium block mt-0.5">{formatCurrency(selectedVehicle.price)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Kilómetros</span>
                  <span className="text-white font-medium block mt-0.5">{selectedVehicle.mileage.toLocaleString('es-ES')} km</span>
                </div>
              </div>

              {/* History Timeline */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6" id="history-timeline">
                
                {/* Active Form inside the timeline for inline creation of events */}
                {isAddHistoryOpen ? (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-black/35 border border-white/10 rounded-xl space-y-4"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        Registrar Evento en Historial
                      </span>
                      <button 
                        onClick={() => setIsAddHistoryOpen(false)}
                        className="text-[10px] font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>

                    <form onSubmit={handleAddHistorySubmit} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Tipo de Evento</label>
                        <div className="relative flex items-center">
                          <select
                            value={histType}
                            onChange={(e) => setHistType(e.target.value as any)}
                            className="w-full bg-black/35 border border-white/10 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                          >
                            <option value="Mantenimiento" className="bg-slate-900 text-white">⚙️ Mantenimiento / Taller</option>
                            <option value="Inspección" className="bg-slate-900 text-white">✓ Inspección de Calidad</option>
                            <option value="Precio" className="bg-slate-900 text-white">💸 Ajuste de Precio</option>
                            <option value="Estado" className="bg-slate-900 text-white">📌 Cambio de Estado</option>
                            <option value="Nota" className="bg-slate-900 text-white">✏️ Nota Administrativa</option>
                          </select>
                          <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 rotate-90 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Título del Evento *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Rectificación de Frenos, Cambio Aceite"
                          value={histTitle}
                          onChange={(e) => setHistTitle(e.target.value)}
                          className="w-full bg-black/35 border border-white/10 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Costo Técnico (€ - Opcional)</label>
                        <input
                          type="number"
                          placeholder="Ej. 150 (Dejar en blanco si no aplica)"
                          value={histCost}
                          onChange={(e) => setHistCost(e.target.value)}
                          className="w-full bg-black/35 border border-white/10 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5">Descripción Detallada *</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Especificaciones técnicas, piezas cambiadas o justificación administrativa del evento..."
                          value={histDescription}
                          onChange={(e) => setHistDescription(e.target.value)}
                          className="w-full bg-black/35 border border-white/10 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500/50 resize-none text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition border border-white/10 cursor-pointer"
                      >
                        Insertar en Historial Vehicular
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  currentUser.permissions.includes('add_history') && (
                    <button
                      onClick={() => setIsAddHistoryOpen(true)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 border border-dashed border-white/15 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Registrar Nuevo Evento de Historial</span>
                    </button>
                  )
                )}

                {/* Timeline Items */}
                <div className="relative border-l-2 border-white/10 pl-6 space-y-6">
                  {selectedVehicle.history && [...selectedVehicle.history]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((evt) => (
                      <div key={evt.id} className="relative text-xs">
                        {/* Timeline Icon Badge */}
                        <div className="absolute -left-10 top-0.5 w-8 h-8 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center shadow-lg">
                          {getHistoryIcon(evt.type)}
                        </div>

                        {/* Event details card */}
                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2 hover:border-white/10 transition">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1 border-b border-white/5">
                            <span className="font-bold text-white text-xs">{evt.title}</span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${getHistoryBadgeClass(evt.type)}`}>
                              {evt.type}
                            </span>
                          </div>
                          
                          <p className="text-slate-300 leading-relaxed text-[11px] whitespace-pre-line">
                            {evt.description}
                          </p>

                          {evt.cost !== undefined && (
                            <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1 pt-0.5">
                              <span>Costo de Operación:</span>
                              <strong>{formatCurrency(evt.cost)}</strong>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 text-[9px] text-slate-500">
                            <span>Registrado por: <strong>{evt.performedBy}</strong></span>
                            <span>Fecha: <strong>{evt.date}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}

                  {(!selectedVehicle.history || selectedVehicle.history.length === 0) && (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No hay registros en el historial de este auto.
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
