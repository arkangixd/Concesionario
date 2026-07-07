import React, { useState, useEffect } from 'react';
import { User, Vehicle, Sale, StockAlert, SystemLog, UserRole, VehicleStatus, HistoryEvent } from './types';
import { 
  INITIAL_USERS, 
  INITIAL_VEHICLES, 
  INITIAL_SALES, 
  INITIAL_ALERTS, 
  INITIAL_LOGS 
} from './data/mockData';

// Views
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import SalesView from './components/SalesView';
import UsersView from './components/UsersView';
import ReportsView from './components/ReportsView';

// Icons
import { 
  LayoutDashboard, 
  Car, 
  TrendingUp, 
  Users, 
  PieChart as ChartIcon, 
  LogOut, 
  User as UserIcon,
  Bell,
  Clock,
  ShieldCheck,
  AlertCircle,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // DB States
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Active Tab State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  // Load from database APIs or fallback to LocalStorage/Seed Data
  useEffect(() => {
    async function loadData() {
      try {
        const [resUsers, resVehicles, resSales, resAlerts, resLogs] = await Promise.all([
          fetch('/api/users').then(r => r.ok ? r.json() : null),
          fetch('/api/vehicles').then(r => r.ok ? r.json() : null),
          fetch('/api/sales').then(r => r.ok ? r.json() : null),
          fetch('/api/alerts').then(r => r.ok ? r.json() : null),
          fetch('/api/logs').then(r => r.ok ? r.json() : null),
        ]);

        let finalUsers = resUsers;
        let finalVehicles = resVehicles;
        let finalSales = resSales;
        let finalAlerts = resAlerts;
        let finalLogs = resLogs;

        // Fallbacks if some APIs failed
        if (!finalUsers) {
          const stored = localStorage.getItem('concesionario_users');
          finalUsers = stored ? JSON.parse(stored) : INITIAL_USERS;
        }
        if (!finalVehicles) {
          const stored = localStorage.getItem('concesionario_vehicles');
          finalVehicles = stored ? JSON.parse(stored) : INITIAL_VEHICLES;
        }
        if (!finalSales) {
          const stored = localStorage.getItem('concesionario_sales');
          finalSales = stored ? JSON.parse(stored) : INITIAL_SALES;
        }
        if (!finalAlerts) {
          const stored = localStorage.getItem('concesionario_alerts');
          finalAlerts = stored ? JSON.parse(stored) : INITIAL_ALERTS;
        }
        if (!finalLogs) {
          const stored = localStorage.getItem('concesionario_logs');
          finalLogs = stored ? JSON.parse(stored) : INITIAL_LOGS;
        }

        setUsers(finalUsers);
        setVehicles(finalVehicles);
        setSales(finalSales);
        setAlerts(finalAlerts);
        setLogs(finalLogs);

        const storedCurrentUser = localStorage.getItem('concesionario_currentUser');
        if (storedCurrentUser) {
          try {
            const parsedUser = JSON.parse(storedCurrentUser);
            if (parsedUser && parsedUser.id && parsedUser.role && parsedUser.name) {
              const exists = finalUsers.find((u: any) => u.id === parsedUser.id && u.active);
              if (exists) {
                setCurrentUser(exists);
              } else {
                localStorage.removeItem('concesionario_currentUser');
                setCurrentUser(null);
              }
            } else {
              localStorage.removeItem('concesionario_currentUser');
              setCurrentUser(null);
            }
          } catch (err) {
            localStorage.removeItem('concesionario_currentUser');
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error("Failed to load from API, falling back to local storage...", err);
        // Fallback
        setUsers(INITIAL_USERS);
        setVehicles(INITIAL_VEHICLES);
        setSales(INITIAL_SALES);
        setAlerts(INITIAL_ALERTS);
        setLogs(INITIAL_LOGS);
      } finally {
        setIsInitializing(false);
      }
    }
    loadData();
  }, []);

  // Save states to LocalStorage on updates
  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addSystemLog = (action: string, details: string, category: SystemLog['category'], customUser?: User) => {
    const operator = customUser || currentUser;
    if (!operator) return;

    const newLog: SystemLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: operator.id,
      userName: operator.name,
      userRole: operator.role,
      action,
      details,
      category
    };

    setLogs(prev => {
      const updated = [newLog, ...prev];
      saveToLocalStorage('concesionario_logs', updated);
      return updated;
    });

    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(e => console.error("Failed to sync log to database", e));
  };

  // Recalculate and update current stocks for alerts in real-time
  const syncAlertsWithCurrentStock = (updatedVehicles: Vehicle[]) => {
    setAlerts(prev => {
      const updatedAlerts = prev.map(alert => {
        let currentStock = 0;
        if (alert.vehicleType === 'General') {
          currentStock = updatedVehicles.filter(v => v.status === 'Disponible').length;
        } else {
          currentStock = updatedVehicles.filter(v => v.type === alert.vehicleType && v.status === 'Disponible').length;
        }
        return {
          ...alert,
          currentStock
        };
      });
      saveToLocalStorage('concesionario_alerts', updatedAlerts);
      return updatedAlerts;
    });
  };

  // ---------------- USER MANAGE ACTIONS ----------------
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveToLocalStorage('concesionario_currentUser', user);
    addSystemLog('Inicio de Sesión', `El operador ingresó al panel administrativo.`, 'Sistema', user);
  };

  const handleLogout = () => {
    if (currentUser) {
      addSystemLog('Cierre de Sesión', `El operador cerró sesión de forma segura.`, 'Sistema');
    }
    setCurrentUser(null);
    localStorage.removeItem('concesionario_currentUser');
  };

  const handleAddUser = (newUserData: Omit<User, 'id' | 'avatarColor'>) => {
    const colors = [
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-indigo-600',
      'from-amber-500 to-orange-600',
      'from-pink-500 to-rose-600',
      'from-purple-500 to-fuchsia-600',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser: User = {
      ...newUserData,
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      avatarColor: randomColor
    };

    setUsers(prev => {
      const updated = [...prev, newUser];
      saveToLocalStorage('concesionario_users', updated);
      return updated;
    });

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    }).catch(e => console.error("Failed to sync new user to DB", e));

    addSystemLog('Creación de Usuario', `Se creó el operador ${newUser.name} con el rol de ${newUser.role}.`, 'Usuarios');
  };

  const handleToggleUserActive = (userId: string) => {
    let nextActiveState = true;
    setUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId) {
          const nextState = !u.active;
          nextActiveState = nextState;
          addSystemLog(
            nextState ? 'Activación de Cuenta' : 'Inactivación de Cuenta', 
            `Se ${nextState ? 'activó' : 'desactivó'} la cuenta del operador ${u.name}.`, 
            'Usuarios'
          );
          
          // Force logout if they deactivate themselves
          if (currentUser && currentUser.id === userId && !nextState) {
            handleLogout();
          }
          return { ...u, active: nextState };
        }
        return u;
      });
      saveToLocalStorage('concesionario_users', updated);
      return updated;
    });

    fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: nextActiveState })
    }).catch(e => console.error("Failed to update user active status in DB", e));
  };

  const handleUpdateUserPermissions = (userId: string, permissions: string[]) => {
    setUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId) {
          addSystemLog(
            'Actualización de Permisos', 
            `Se actualizaron los permisos individuales para ${u.name}.`, 
            'Usuarios'
          );
          
          // Sync current session permissions if they modified their own account
          if (currentUser && currentUser.id === userId) {
            const updatedSelf = { ...currentUser, permissions };
            setCurrentUser(updatedSelf);
            saveToLocalStorage('concesionario_currentUser', updatedSelf);
          }
          return { ...u, permissions };
        }
        return u;
      });
      saveToLocalStorage('concesionario_users', updated);
      return updated;
    });

    fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions })
    }).catch(e => console.error("Failed to update user permissions in DB", e));
  };

  // ---------------- VEHICLE INVENTORY ACTIONS ----------------
  const handleAddVehicle = (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'history'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      history: [
        {
          id: `hist-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString().split('T')[0],
          type: 'Inspección',
          title: 'Registro Inicial e Inspección',
          description: `Vehículo ingresado al concesionario por ${currentUser?.name}. Inspección técnica inicial aprobada.`,
          performedBy: currentUser?.name || 'Sistema'
        }
      ]
    };

    setVehicles(prev => {
      const updated = [...prev, newVehicle];
      saveToLocalStorage('concesionario_vehicles', updated);
      syncAlertsWithCurrentStock(updated);
      return updated;
    });

    fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVehicle)
    }).catch(e => console.error("Failed to sync new vehicle to DB", e));

    addSystemLog('Alta de Vehículo', `Se incorporó un ${newVehicle.brand} ${newVehicle.model} al inventario con VIN ${newVehicle.vin}.`, 'Inventario');
  };

  const handleUpdateVehicleStatus = (id: string, status: VehicleStatus) => {
    setVehicles(prev => {
      const updated = prev.map(v => {
        if (v.id === id) {
          addSystemLog('Cambio de Estado', `El estado del vehículo con VIN ${v.vin} cambió de ${v.status} a ${status}.`, 'Inventario');
          return { ...v, status };
        }
        return v;
      });
      saveToLocalStorage('concesionario_vehicles', updated);
      syncAlertsWithCurrentStock(updated);
      return updated;
    });

    fetch(`/api/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(e => console.error("Failed to update vehicle status in DB", e));
  };

  const handleDeleteVehicle = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;

    setVehicles(prev => {
      const updated = prev.filter(v => v.id !== id);
      saveToLocalStorage('concesionario_vehicles', updated);
      syncAlertsWithCurrentStock(updated);
      return updated;
    });

    fetch(`/api/vehicles/${id}`, {
      method: 'DELETE'
    }).catch(e => console.error("Failed to delete vehicle in DB", e));

    addSystemLog('Baja de Vehículo', `Se eliminó el ${vehicle.brand} ${vehicle.model} (${vehicle.vin}) del inventario.`, 'Inventario');
  };

  const handleAddHistoryEvent = (vehicleId: string, eventData: Omit<HistoryEvent, 'id' | 'date' | 'performedBy'>) => {
    const newEvent: HistoryEvent = {
      ...eventData,
      id: `hist-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString().split('T')[0],
      performedBy: currentUser?.name || 'Sistema'
    };

    setVehicles(prev => {
      const updated = prev.map(v => {
        if (v.id === vehicleId) {
          const updatedHistory = [...v.history, newEvent];
          
          // If event type is a price change, we update the main listing price as well
          let updatedPrice = v.price;
          if (newEvent.type === 'Precio' && newEvent.cost) {
            updatedPrice = newEvent.cost;
          }

          addSystemLog(
            'Historial Actualizado', 
            `Se agregó un evento de tipo ${newEvent.type} ("${newEvent.title}") al historial del ${v.brand} ${v.model}.`, 
            'Inventario'
          );

          return { 
            ...v, 
            history: updatedHistory,
            price: updatedPrice
          };
        }
        return v;
      });
      saveToLocalStorage('concesionario_vehicles', updated);
      return updated;
    });

    fetch(`/api/vehicles/${vehicleId}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent)
    }).catch(e => console.error("Failed to sync vehicle history event in DB", e));

    if (newEvent.type === 'Precio' && newEvent.cost) {
      fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newEvent.cost })
      }).catch(e => console.error("Failed to update vehicle price in DB", e));
    }
  };

  // ---------------- SALES MODULE ACTIONS ----------------
  const handleRegisterSale = (saleData: Omit<Sale, 'id' | 'sellerId' | 'sellerName' | 'date'>) => {
    if (!currentUser) return;

    const newSale: Sale = {
      ...saleData,
      id: `FAC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      date: new Date().toISOString().split('T')[0]
    };

    const saleEvent: HistoryEvent = {
      id: `hist-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Venta',
      title: 'Venta Facturada y Entregada',
      description: `Auto vendido al comprador ${saleData.buyerName} (NIF: ${saleData.buyerDni}) mediante modalidad ${saleData.paymentMethod}.`,
      cost: saleData.salePrice,
      performedBy: currentUser.name
    };

    // 1. Update sales registry
    setSales(prev => {
      const updated = [newSale, ...prev];
      saveToLocalStorage('concesionario_sales', updated);
      return updated;
    });

    // 2. Cascade update vehicle: set status as 'Vendido' and append a 'Venta' event to its history
    setVehicles(prev => {
      const updated = prev.map(v => {
        if (v.id === saleData.vehicleId) {
          return {
            ...v,
            status: 'Vendido' as VehicleStatus,
            history: [...v.history, saleEvent]
          };
        }
        return v;
      });
      saveToLocalStorage('concesionario_vehicles', updated);
      syncAlertsWithCurrentStock(updated);
      return updated;
    });

    // Sync to backend
    fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSale)
    }).catch(e => console.error("Failed to sync sale in DB", e));

    fetch(`/api/vehicles/${saleData.vehicleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Vendido' })
    }).catch(e => console.error("Failed to update vehicle status in DB", e));

    fetch(`/api/vehicles/${saleData.vehicleId}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleEvent)
    }).catch(e => console.error("Failed to sync sale history event in DB", e));

    addSystemLog(
      'Venta Realizada', 
      `Se facturó con éxito el vehículo ${saleData.vehicleName} por un monto de €${saleData.salePrice.toLocaleString('es-ES')}.`, 
      'Ventas'
    );
  };

  // ---------------- ALERTS THRESHOLD CONFIG ----------------
  const handleUpdateAlertThreshold = (alertId: string, threshold: number, isActive: boolean) => {
    setAlerts(prev => {
      const updated = prev.map(a => {
        if (a.id === alertId) {
          addSystemLog(
            'Configuración de Alertas', 
            `Se ajustó el umbral de alerta para ${a.vehicleType} a ${threshold} unidades (Estado: ${isActive ? 'Activo' : 'Inactivo'}).`, 
            'Sistema'
          );
          return { ...a, threshold, isActive };
        }
        return a;
      });
      saveToLocalStorage('concesionario_alerts', updated);
      return updated;
    });

    fetch(`/api/alerts/${alertId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threshold, isActive })
    }).catch(e => console.error("Failed to update alert configuration in DB", e));
  };

  // Quick account switcher for testing roles inside app header
  const handleRoleQuickSwitch = (role: UserRole) => {
    const matchUser = users.find(u => u.role === role && u.active);
    if (matchUser) {
      setCurrentUser(matchUser);
      saveToLocalStorage('concesionario_currentUser', matchUser);
      addSystemLog('Cambio Rápido de Cuenta', `Se alternó la sesión administrativa al rol ${role} para pruebas.`, 'Sistema', matchUser);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans" id="app-loading">
        <Car className="w-12 h-12 text-emerald-400 animate-bounce mb-3" />
        <h3 className="font-bold text-sm tracking-wide">Cargando Concesionario...</h3>
      </div>
    );
  }

  if (!currentUser || !currentUser.id || !currentUser.role || !currentUser.name) {
    return <LoginView users={users} onLogin={handleLogin} />;
  }

  // Calculate live general alerts to show in top bar
  const activeGeneralAlertCount = alerts.filter(alert => {
    if (!alert.isActive) return false;
    if (alert.vehicleType === 'General') {
      const currentGeneralStock = vehicles.filter(v => v.status === 'Disponible').length;
      return currentGeneralStock < alert.threshold;
    } else {
      const currentTypeStock = vehicles.filter(v => v.type === alert.vehicleType && v.status === 'Disponible').length;
      return currentTypeStock < alert.threshold;
    }
  }).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative overflow-hidden" id="app-workspace">
      
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/15 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/15 blur-[120px]"></div>
        <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[130px]"></div>
      </div>

      {/* Top Header Workspace */}
      <header className="bg-slate-900/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 px-4 py-3 sm:px-6 flex items-center justify-between" id="app-topbar">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/5 border border-white/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight block">AUTOSERENE</span>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Gestión Concesionario</span>
          </div>
        </div>

        {/* Core Playground Switcher + Auth Controls */}
        <div className="flex items-center gap-3.5">
          
          {/* Quick switcher inside header for demoing */}
          <div className="hidden lg:flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 p-1.5 rounded-xl text-[10px]">
            <span className="text-slate-400 font-bold uppercase tracking-wider px-2 shrink-0">Simulador:</span>
            <div className="flex gap-1">
              {(['ADMIN', 'GERENTE', 'VENDEDOR'] as const).map(role => {
                const isSelected = currentUser.role === role;
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleQuickSwitch(role)}
                    className={`px-2.5 py-1 rounded-md font-bold uppercase transition tracking-wider ${
                      isSelected 
                        ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {role === 'GERENTE' ? 'Gerente' : role === 'VENDEDOR' ? 'Vendedor' : 'Admin'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active low-stock alert counter */}
          {activeGeneralAlertCount > 0 && (
            <div className="relative cursor-pointer" onClick={() => setActiveTab('reports')} title="Ver Alertas de Stock">
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {activeGeneralAlertCount}
              </span>
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
          )}

          {/* Session Profile card */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-white block truncate max-w-[120px]">{currentUser.name}</span>
              <span className="text-[9px] text-slate-400 block uppercase font-bold">{currentUser.role}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition"
              title="Cerrar sesión segura"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main workspace layout */}
      <div className="flex-1 flex flex-col md:flex-row" id="app-body">
        
        {/* Workspace Sidebar / Navigation rail */}
        <aside className="w-full md:w-64 bg-white/5 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 p-4 shrink-0" id="app-sidebar">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
            
            {/* Nav 1: Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition shrink-0 md:shrink ${
                activeTab === 'dashboard'
                  ? 'bg-white/10 text-white border border-white/15 backdrop-blur-md shadow-lg shadow-black/10'
                  : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span>Tablero Inicial</span>
            </button>

            {/* Nav 2: Inventory */}
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition shrink-0 md:shrink ${
                activeTab === 'inventory'
                  ? 'bg-white/10 text-white border border-white/15 backdrop-blur-md shadow-lg shadow-black/10'
                  : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
              }`}
            >
              <Car className="w-4.5 h-4.5" />
              <span>Inventario y Autos</span>
            </button>

            {/* Nav 3: Sales */}
            <button
              onClick={() => setActiveTab('sales')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition shrink-0 md:shrink ${
                activeTab === 'sales'
                  ? 'bg-white/10 text-white border border-white/15 backdrop-blur-md shadow-lg shadow-black/10'
                  : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5" />
              <span>Ventas e Históricos</span>
            </button>

            {/* Nav 4: Reports (Admin/Manager only, otherwise locked look or hidden) */}
            <button
              onClick={() => {
                if (currentUser.role === 'VENDEDOR') {
                  alert('Tu rol de Vendedor no tiene privilegios de auditoría de reportes financieros.');
                  return;
                }
                setActiveTab('reports');
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition shrink-0 md:shrink ${
                activeTab === 'reports'
                  ? 'bg-white/10 text-white border border-white/15 backdrop-blur-md shadow-lg shadow-black/10'
                  : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
              } ${currentUser.role === 'VENDEDOR' ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <ChartIcon className="w-4.5 h-4.5" />
                <span>Balances e Alertas</span>
              </div>
              {currentUser.role === 'VENDEDOR' && <Lock className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Nav 5: Security / Users */}
            <button
              onClick={() => {
                if (currentUser.role !== 'ADMIN') {
                  alert('Módulo protegido. Se requieren credenciales de Administrador para configurar permisos.');
                  return;
                }
                setActiveTab('users');
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition shrink-0 md:shrink ${
                activeTab === 'users'
                  ? 'bg-white/10 text-white border border-white/15 backdrop-blur-md shadow-lg shadow-black/10'
                  : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
              } ${currentUser.role !== 'ADMIN' ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4.5 h-4.5" />
                <span>Seguridad y Usuarios</span>
              </div>
              {currentUser.role !== 'ADMIN' && <Lock className="w-3.5 h-3.5 text-slate-500" />}
            </button>

          </nav>

          {/* Quick info banner bottom */}
          <div className="hidden md:block mt-8 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase tracking-wider text-[9px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Control de Permisos</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Sistema que valida de forma estricta los privilegios antes de ejecutar operaciones de inventario o facturación comercial.
            </p>
          </div>
        </aside>

        {/* Central Workspace Router Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)] scrollbar-none" id="app-main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView 
                  currentUser={currentUser}
                  vehicles={vehicles}
                  sales={sales}
                  alerts={alerts}
                  logs={logs}
                  onNavigate={(tab) => {
                    // Check permissions before navigation redirect
                    if (tab === 'reports' && currentUser.role === 'VENDEDOR') {
                      alert('Tu cuenta no tiene permisos para acceder a balances financieros.');
                      return;
                    }
                    setActiveTab(tab);
                  }}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryView 
                  currentUser={currentUser}
                  vehicles={vehicles}
                  onAddVehicle={handleAddVehicle}
                  onUpdateVehicleStatus={handleUpdateVehicleStatus}
                  onAddHistoryEvent={handleAddHistoryEvent}
                  onDeleteVehicle={handleDeleteVehicle}
                />
              )}

              {activeTab === 'sales' && (
                <SalesView 
                  currentUser={currentUser}
                  vehicles={vehicles}
                  sales={sales}
                  onRegisterSale={handleRegisterSale}
                />
              )}

              {activeTab === 'users' && (
                <UsersView 
                  currentUser={currentUser}
                  users={users}
                  onAddUser={handleAddUser}
                  onToggleUserActive={handleToggleUserActive}
                  onUpdateUserPermissions={handleUpdateUserPermissions}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView 
                  currentUser={currentUser}
                  vehicles={vehicles}
                  sales={sales}
                  alerts={alerts}
                  onUpdateAlertThreshold={handleUpdateAlertThreshold}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
