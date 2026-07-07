import { User, Vehicle, Sale, StockAlert, SystemLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Carlos Mendoza',
    email: 'admin@concesionario.com',
    role: 'ADMIN',
    permissions: ['all_access', 'manage_users', 'manage_inventory', 'make_sales', 'view_reports'],
    active: true,
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'usr-gerente',
    name: 'Elena Rostova',
    email: 'gerente@concesionario.com',
    role: 'GERENTE',
    permissions: ['manage_inventory', 'view_reports', 'edit_history'],
    active: true,
    avatarColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'usr-vendedor1',
    name: 'Mario Gómez',
    email: 'mario@concesionario.com',
    role: 'VENDEDOR',
    permissions: ['make_sales', 'add_history'],
    active: true,
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'usr-vendedor2',
    name: 'Sofía Castro',
    email: 'sofia@concesionario.com',
    role: 'VENDEDOR',
    permissions: ['make_sales', 'add_history'],
    active: false, // Proves active/inactive security status works
    avatarColor: 'from-pink-500 to-rose-600',
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    vin: '1FTFW1ED5KFA99812',
    brand: 'Tesla',
    model: 'Model 3 Performance',
    year: 2024,
    price: 48900,
    originalPrice: 51000,
    mileage: 12400,
    color: 'Blanco Perla',
    transmission: 'Automático',
    fuel: 'Eléctrico',
    type: 'Eléctrico',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T14:30:00Z',
    history: [
      {
        id: 'hist-1-1',
        date: '2026-01-15',
        type: 'Inspección',
        title: 'Inspección de Recepción',
        description: 'Vehículo ingresado al concesionario en excelentes condiciones. Batería al 98% de salud.',
        performedBy: 'Elena Rostova',
      },
      {
        id: 'hist-1-2',
        date: '2026-02-10',
        type: 'Mantenimiento',
        title: 'Detallado Estético y Pulido',
        description: 'Lavado a detalle, tratamiento cerámico protector para pintura exterior y limpieza de tapicería de cuero vegano blanca.',
        cost: 350,
        performedBy: 'Carlos Mendoza',
      },
      {
        id: 'hist-1-3',
        date: '2026-04-05',
        type: 'Precio',
        title: 'Ajuste de Precio para Primavera',
        description: 'Ajuste de precio promocional de $51,000 a $48,900 para impulsar rotación de inventario.',
        performedBy: 'Elena Rostova',
      }
    ]
  },
  {
    id: 'veh-2',
    vin: '1FA6P8CF0H5105234',
    brand: 'Ford',
    model: 'Mustang GT',
    year: 2023,
    price: 42500,
    originalPrice: 42500,
    mileage: 8500,
    color: 'Azul Eléctrico',
    transmission: 'Manual',
    fuel: 'Gasolina',
    type: 'Deportivo',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1611245801311-66774e1d7463?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-02-05T09:15:00Z',
    history: [
      {
        id: 'hist-2-1',
        date: '2026-02-06',
        type: 'Inspección',
        title: 'Inspección Mecánica Completa',
        description: 'Verificación de motor V8 de 5.0L. Suspensión y frenos en perfecto estado.',
        performedBy: 'Carlos Mendoza',
      },
      {
        id: 'hist-2-2',
        date: '2026-03-20',
        type: 'Mantenimiento',
        title: 'Cambio de Aceite y Filtro',
        description: 'Reemplazo de aceite sintético de alta gama 5W-50 y filtro de aceite de carreras.',
        cost: 180,
        performedBy: 'Mario Gómez',
      }
    ]
  },
  {
    id: 'veh-3',
    vin: 'JTDKN3DU1H4018247',
    brand: 'Toyota',
    model: 'RAV4 Hybrid Limited',
    year: 2024,
    price: 38500,
    originalPrice: 38500,
    mileage: 1500,
    color: 'Gris Grafito',
    transmission: 'Automático',
    fuel: 'Híbrido',
    type: 'SUV',
    status: 'Reservado',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-03-12T11:45:00Z',
    history: [
      {
        id: 'hist-3-1',
        date: '2026-03-13',
        type: 'Inspección',
        title: 'Inspección de Entrega Inicial',
        description: 'Vehículo seminuevo verificado. Sistema híbrido y batería auxiliar sin fallos. Tracción AWD funcional.',
        performedBy: 'Elena Rostova',
      },
      {
        id: 'hist-3-2',
        date: '2026-06-30',
        type: 'Estado',
        title: 'Reservado por Cliente',
        description: 'Cliente dejó un depósito del 10% para apartar el vehículo, en espera de aprobación de crédito bancario.',
        performedBy: 'Mario Gómez',
      }
    ]
  },
  {
    id: 'veh-4',
    vin: '1GCVKREC5JE190246',
    brand: 'Chevrolet',
    model: 'Silverado Trail Boss',
    year: 2022,
    price: 49800,
    originalPrice: 51200,
    mileage: 32000,
    color: 'Negro Obsidiana',
    transmission: 'Automático',
    fuel: 'Gasolina',
    type: 'Pickup',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-04-18T16:00:00Z',
    history: [
      {
        id: 'hist-4-1',
        date: '2026-04-19',
        type: 'Inspección',
        title: 'Inspección Técnica de Remolque',
        description: 'Inspección de chasis, suspensión levantada Z71 de fábrica y frenos traseros. Pastillas delanteras cambiadas.',
        cost: 250,
        performedBy: 'Carlos Mendoza',
      },
      {
        id: 'hist-4-2',
        date: '2026-05-12',
        type: 'Mantenimiento',
        title: 'Rotación de Neumáticos Off-Road',
        description: 'Rotación y balanceo de los 4 neumáticos Wrangler Duratrac de 33". Ajuste de presión.',
        cost: 90,
        performedBy: 'Elena Rostova',
      }
    ]
  },
  {
    id: 'veh-5',
    vin: 'WBA8E1C5XKF883491',
    brand: 'BMW',
    model: 'M340i xDrive',
    year: 2023,
    price: 54900,
    originalPrice: 54900,
    mileage: 18700,
    color: 'Gris Nardo',
    transmission: 'Automático',
    fuel: 'Gasolina',
    type: 'Sedán',
    status: 'Mantenimiento',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-05-01T10:00:00Z',
    history: [
      {
        id: 'hist-5-1',
        date: '2026-05-02',
        type: 'Inspección',
        title: 'Diagnóstico Computarizado Inicial',
        description: 'Escanéo completo OBD-II. Se detectó un leve desajuste en el sensor de presión de turbo. No hay códigos graves.',
        performedBy: 'Elena Rostova',
      },
      {
        id: 'hist-5-2',
        date: '2026-07-06',
        type: 'Estado',
        title: 'Ingresado a Taller',
        description: 'Vehículo trasladado al área de mantenimiento para service mayor de los 20,000 km y calibración de suspensión activa.',
        performedBy: 'Carlos Mendoza',
      }
    ]
  },
  {
    id: 'veh-6',
    vin: 'WP0AA298XKS128472',
    brand: 'Porsche',
    model: '911 Carrera S',
    year: 2021,
    price: 115000,
    originalPrice: 115000,
    mileage: 14200,
    color: 'Rojo Guardias',
    transmission: 'Automático',
    fuel: 'Gasolina',
    type: 'Deportivo',
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-05-20T13:20:00Z',
    history: [
      {
        id: 'hist-6-1',
        date: '2026-05-21',
        type: 'Inspección',
        title: 'Inspección Exhaustiva de Recepción',
        description: 'Inspección multipunto premium. Diagnóstico de motor bóxer de 3.0L biturbo. Sistema de escape deportivo verificado.',
        performedBy: 'Elena Rostova',
      }
    ]
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    vehicleId: 'veh-sold-1',
    vehicleName: 'Jeep Wrangler Rubicon 2022',
    salePrice: 47500,
    sellerId: 'usr-vendedor1',
    sellerName: 'Mario Gómez',
    buyerName: 'Alejandro Ruiz',
    buyerDni: '12345678-A',
    buyerPhone: '+34 600 111 222',
    buyerEmail: 'alejandro.ruiz@gmail.com',
    date: '2026-02-15',
    paymentMethod: 'Contado'
  },
  {
    id: 'sale-2',
    vehicleId: 'veh-sold-2',
    vehicleName: 'Audi A4 S-Line 2023',
    salePrice: 39900,
    sellerId: 'usr-vendedor1',
    sellerName: 'Mario Gómez',
    buyerName: 'Lucía Fernández',
    buyerDni: '87654321-B',
    buyerPhone: '+34 611 222 333',
    buyerEmail: 'lucia.f@hotmail.com',
    date: '2026-03-08',
    paymentMethod: 'Financiado'
  },
  {
    id: 'sale-3',
    vehicleId: 'veh-sold-3',
    vehicleName: 'Hyundai Tucson Techno 2023',
    salePrice: 31500,
    sellerId: 'usr-vendedor2',
    sellerName: 'Sofía Castro',
    buyerName: 'Roberto Soler',
    buyerDni: '45678912-C',
    buyerPhone: '+34 622 333 444',
    buyerEmail: 'roberto.soler@outlook.com',
    date: '2026-04-20',
    paymentMethod: 'Transferencia'
  },
  {
    id: 'sale-4',
    vehicleId: 'veh-sold-4',
    vehicleName: 'Mazda CX-30 Zenith 2024',
    salePrice: 28900,
    sellerId: 'usr-vendedor1',
    sellerName: 'Mario Gómez',
    buyerName: 'Marta Jiménez',
    buyerDni: '98765432-D',
    buyerPhone: '+34 633 444 555',
    buyerEmail: 'marta.jimenez@gmail.com',
    date: '2026-05-14',
    paymentMethod: 'Contado'
  },
  {
    id: 'sale-5',
    vehicleId: 'veh-sold-5',
    vehicleName: 'Mercedes-Benz A200 AMG 2023',
    salePrice: 36200,
    sellerId: 'usr-vendedor1',
    sellerName: 'Mario Gómez',
    buyerName: 'Carlos Santillán',
    buyerDni: '34567890-E',
    buyerPhone: '+34 644 555 666',
    buyerEmail: 'csantillan@corp.com',
    date: '2026-06-02',
    paymentMethod: 'Financiado'
  },
  {
    id: 'sale-6',
    vehicleId: 'veh-sold-6',
    vehicleName: 'Nissan Qashqai N-Connecta 2022',
    salePrice: 24500,
    sellerId: 'usr-vendedor2',
    sellerName: 'Sofía Castro',
    buyerName: 'Patricia Conde',
    buyerDni: '23456789-F',
    buyerPhone: '+34 655 666 777',
    buyerEmail: 'patricia.conde@yahoo.com',
    date: '2026-06-25',
    paymentMethod: 'Transferencia'
  },
  {
    id: 'sale-7',
    vehicleId: 'veh-sold-7',
    vehicleName: 'Fiat 500e Icon 2023',
    salePrice: 21000,
    sellerId: 'usr-vendedor1',
    sellerName: 'Mario Gómez',
    buyerName: 'Andrés Morales',
    buyerDni: '11223344-G',
    buyerPhone: '+34 666 777 888',
    buyerEmail: 'andres.mo@gmail.com',
    date: '2026-07-04',
    paymentMethod: 'Contado'
  }
];

export const INITIAL_ALERTS: StockAlert[] = [
  {
    id: 'alert-1',
    vehicleType: 'General',
    threshold: 5,
    currentStock: 5, // We have 5 Available/Reserved/Maintenance vehicles in mock inventory
    isActive: true
  },
  {
    id: 'alert-2',
    vehicleType: 'Sedán',
    threshold: 2,
    currentStock: 1, // Only BMW is a Sedan in available/reserved/maintenance list
    isActive: true
  },
  {
    id: 'alert-3',
    vehicleType: 'SUV',
    threshold: 2,
    currentStock: 1, // Only RAV4
    isActive: true
  },
  {
    id: 'alert-4',
    vehicleType: 'Eléctrico',
    threshold: 1,
    currentStock: 1, // Only Tesla Model 3
    isActive: false
  },
  {
    id: 'alert-5',
    vehicleType: 'Deportivo',
    threshold: 2,
    currentStock: 2, // Mustang and Porsche
    isActive: true
  }
];

export const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-01T09:00:00Z',
    userId: 'usr-admin',
    userName: 'Carlos Mendoza',
    userRole: 'ADMIN',
    action: 'Inicio de Sistema',
    details: 'Servidor y sistema de base de datos cargados de forma segura.',
    category: 'Sistema'
  },
  {
    id: 'log-2',
    timestamp: '2026-07-04T12:30:00Z',
    userId: 'usr-vendedor1',
    userName: 'Mario Gómez',
    userRole: 'VENDEDOR',
    action: 'Registro de Venta',
    details: 'Se vendió un Fiat 500e Icon 2023 por $21,000 al comprador Andrés Morales.',
    category: 'Ventas'
  },
  {
    id: 'log-3',
    timestamp: '2026-07-06T15:45:00Z',
    userId: 'usr-admin',
    userName: 'Carlos Mendoza',
    userRole: 'ADMIN',
    action: 'Actualización de Inventario',
    details: 'Se ingresó el BMW M340i xDrive 2023 al taller para mantenimiento.',
    category: 'Inventario'
  },
  {
    id: 'log-4',
    timestamp: '2026-07-07T08:15:00Z',
    userId: 'usr-admin',
    userName: 'Carlos Mendoza',
    userRole: 'ADMIN',
    action: 'Cambio de Permisos',
    details: 'Se actualizaron las políticas de acceso de seguridad para el rol VENDEDOR.',
    category: 'Usuarios'
  }
];
