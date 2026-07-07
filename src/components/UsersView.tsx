import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Users, 
  ShieldAlert, 
  UserPlus, 
  Check, 
  X, 
  UserX, 
  UserCheck, 
  Lock, 
  Unlock,
  KeyRound,
  Mail,
  User as UserIcon,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UsersViewProps {
  currentUser: User;
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'avatarColor'>) => void;
  onToggleUserActive: (id: string) => void;
  onUpdateUserPermissions: (id: string, permissions: string[]) => void;
}

export default function UsersView({
  currentUser,
  users,
  onAddUser,
  onToggleUserActive,
  onUpdateUserPermissions
}: UsersViewProps) {
  // Navigation & Form UI states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingPermissionsUserId, setEditingPermissionsUserId] = useState<string | null>(null);

  // New User Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('VENDEDOR');

  // Available permissions lists
  const ALL_SYSTEM_PERMISSIONS = [
    { key: 'manage_inventory', name: 'Gestión de Inventario', desc: 'Permite registrar, editar y eliminar vehículos' },
    { key: 'make_sales', name: 'Registrar Ventas', desc: 'Permite facturar vehículos y registrar transacciones' },
    { key: 'view_reports', name: 'Ver Reportes', desc: 'Acceso a balances financieros mensuales y auditorías' },
    { key: 'edit_history', name: 'Historial Completo', desc: 'Permite modificar cualquier evento del historial vehicular' },
    { key: 'add_history', name: 'Añadir Historial', desc: 'Permite insertar nuevos logs al historial de un auto' },
    { key: 'manage_users', name: 'Gestionar Usuarios', desc: 'Acceso al módulo de seguridad de usuarios y permisos' },
  ];

  // Map roles to default permissions
  const getDefaultPermissionsForRole = (role: UserRole): string[] => {
    switch (role) {
      case 'ADMIN':
        return ['all_access', 'manage_users', 'manage_inventory', 'make_sales', 'view_reports', 'edit_history', 'add_history'];
      case 'GERENTE':
        return ['manage_inventory', 'view_reports', 'edit_history', 'add_history'];
      case 'VENDEDOR':
        return ['make_sales', 'add_history'];
    }
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    onAddUser({
      name,
      email: email.trim().toLowerCase(),
      role,
      permissions: getDefaultPermissionsForRole(role),
      active: true
    });

    // Reset Form
    setName('');
    setEmail('');
    setRole('VENDEDOR');
    setIsAddUserOpen(false);
  };

  // Toggle individual permissions checkboxes
  const handlePermissionToggle = (userId: string, permissionKey: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    let updatedPermissions = [...user.permissions];
    if (updatedPermissions.includes(permissionKey)) {
      updatedPermissions = updatedPermissions.filter(p => p !== permissionKey);
    } else {
      updatedPermissions.push(permissionKey);
    }

    onUpdateUserPermissions(userId, updatedPermissions);
  };

  return (
    <div className="space-y-6" id="users-module">
      
      {/* Module Title */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg" id="users-header">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Panel de Administración e Seguridad</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Administración de credenciales de operadores, activación de cuentas y políticas de acceso granular (RBAC).
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition flex items-center gap-1.5 self-stretch sm:self-auto justify-center cursor-pointer border border-white/10 shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Operador</span>
          </button>
        )}
      </div>

      {/* Security Info Panel */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 flex gap-3 text-xs text-slate-300 shadow-md">
        <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-semibold mb-0.5">Auditoría de Control de Acceso Activa</strong>
          <p className="leading-relaxed text-[11px] text-slate-300">
            Solo los administradores autorizados pueden alterar políticas de acceso, activar/desactivar cuentas o configurar permisos específicos. Los cambios son de efecto inmediato en toda la sesión del usuario.
          </p>
        </div>
      </div>

      {/* Users List Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="users-grid">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUser.id;
          const isUserEditing = editingPermissionsUserId === user.id;

          return (
            <div 
              key={user.id}
              className={`bg-white/5 border rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all duration-300 relative backdrop-blur-xl shadow-lg ${
                user.active 
                  ? 'border-white/10 hover:border-white/20' 
                  : 'border-rose-950/40 opacity-70 bg-black/40'
              }`}
            >
              {/* Header profile info */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${user.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-md`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {isCurrentUser && (
                        <span className="text-[9px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded font-semibold border border-white/5">Tú</span>
                      )}
                    </h3>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{user.email}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold tracking-wider uppercase ${
                    user.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    user.role === 'GERENTE' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {user.role}
                  </span>
                  
                  {/* Active/Inactive Status indicator */}
                  <span className={`text-[9px] font-bold uppercase flex items-center gap-1 ${
                    user.active ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
                    {user.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Dynamic Permissions List overview */}
              <div className="space-y-2 border-t border-white/10 pt-3">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                  <span>Permisos Otorgados</span>
                  
                  {currentUser.role === 'ADMIN' && !isCurrentUser && (
                    <button
                      onClick={() => setEditingPermissionsUserId(isUserEditing ? null : user.id)}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <KeyRound className="w-3 h-3" />
                      {isUserEditing ? 'Cerrar Ajustes' : 'Ajustar Permisos'}
                    </button>
                  )}
                </div>

                {isUserEditing ? (
                  /* Custom Checkbox panel for permission editing */
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2.5 p-3 bg-black/35 rounded-xl border border-white/10"
                  >
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Editar privilegios para {user.name}:</span>
                    <div className="space-y-1.5">
                      {ALL_SYSTEM_PERMISSIONS.map(p => {
                        const hasPermission = user.permissions.includes(p.key) || user.permissions.includes('all_access');
                        const isInherited = user.role === 'ADMIN';

                        return (
                          <label 
                            key={p.key} 
                            className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs transition cursor-pointer ${
                              hasPermission 
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200' 
                                : 'bg-black/20 border-white/10 text-slate-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              disabled={isInherited} // Admin automatically has everything, no toggle needed
                              onChange={() => handlePermissionToggle(user.id, p.key)}
                              className="mt-0.5 rounded border-white/10 bg-slate-950 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
                            />
                            <div>
                              <span className="font-bold block text-[11px] text-white">{p.name}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 leading-normal">{p.desc}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  /* Static tags showing granted permissions */
                  <div className="flex flex-wrap gap-1.5">
                    {user.permissions.includes('all_access') ? (
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/10 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        Superusuario (Acceso Total)
                      </span>
                    ) : (
                      user.permissions.map(perm => {
                        const info = ALL_SYSTEM_PERMISSIONS.find(p => p.key === perm);
                        return (
                          <span 
                            key={perm}
                            className="bg-white/5 text-slate-300 border border-white/5 text-[9px] font-bold px-2 py-0.5 rounded uppercase"
                          >
                            {info ? info.name : perm}
                          </span>
                        );
                      })
                    )}
                    {user.permissions.length === 0 && (
                      <span className="text-slate-400 text-[11px]">Sin permisos asignados.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Inactivation Controls */}
              {currentUser.role === 'ADMIN' && !isCurrentUser && (
                <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
                  <button
                    onClick={() => onToggleUserActive(user.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 border cursor-pointer ${
                      user.active 
                        ? 'bg-white/5 hover:bg-rose-500/10 border-white/10 text-slate-300 hover:text-rose-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950'
                    }`}
                  >
                    {user.active ? (
                      <>
                        <UserX className="w-3.5 h-3.5 shrink-0" />
                        <span>Desactivar Operador</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Reactivar Operador</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {isAddUserOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950/90 border border-white/15 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col backdrop-blur-2xl"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  <span>Crear Nuevo Operador del Concesionario</span>
                </h3>
                <button 
                  onClick={() => setIsAddUserOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre Completo *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Roberto Gómez Bolaños"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-black/35 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico *</label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="Ej. roberto@concesionario.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-black/35 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rol Operativo Inicial *</label>
                  <div className="relative flex items-center">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full bg-black/35 border border-white/10 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-xs cursor-pointer appearance-none"
                    >
                      <option value="VENDEDOR" className="bg-slate-900 text-white">Vendedor (Acciones comerciales limitadas)</option>
                      <option value="GERENTE" className="bg-slate-900 text-white">Gerente (Gestión de stock, taller e informes)</option>
                      <option value="ADMIN" className="bg-slate-900 text-white">Administrador (Acceso total e integral)</option>
                    </select>
                    <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 rotate-90 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 pl-1 leading-normal">
                    Se asignarán permisos por defecto automáticos según el rol. Posteriormente podrá editarlos individualmente.
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-white/10 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition border border-white/10 cursor-pointer"
                  >
                    Registrar Cuenta
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
