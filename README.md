# 🚗 Sistema de Gestión de Inventario y Concesionario (Dealership Management System)

Este es un sistema full-stack interactivo desarrollado en **React** (con **Vite** y **Tailwind CSS**) y un backend en **Express** con **TypeScript**, persistido sobre **PostgreSQL** mediante **Drizzle ORM** e impulsado por **Gemini AI**.

---

## 🛠️ Características Principales

- **Gestión de Inventario**: Visualiza, añade y edita vehículos con detalles de estado, kilometraje, precio, etc.
- **Historial de Vehículos**: Panel lateral interactivo para registrar mantenimientos, ajustes de precios, lavados, etc. (¡Cierra haciendo clic fuera o pulsando el fondo!).
- **Panel de Ventas**: Simulador para registrar operaciones de venta de autos en tiempo real.
- **Gráficos e Informes**: Visualización interactiva de estadísticas de ventas y rendimiento con Recharts.
- **Seguridad por Roles**: Accesos controlados según el rol del usuario (Administrador, Gerente, Vendedor).
- **Asistente Inteligente**: Sugerencias potenciadas por la API de **Gemini AI**.

---

## 🚀 Requisitos Previos

Antes de ejecutar la aplicación de forma local, asegúrate de tener instalado:

1. **Node.js** (v18 o superior recomendado)
2. **PostgreSQL** (Iniciado y con una base de datos creada)

---

## ⚙️ Configuración del Entorno (`.env`)

1. Copia el archivo de ejemplo para crear tu configuración local:
   ```bash
   cp .env.example .env
   ```

2. Abre el archivo `.env` en tu editor y completa las variables de entorno con tus credenciales de PostgreSQL y tu clave de Gemini:

   ```env
   # API de Gemini (Opcional, para funciones de Inteligencia Artificial)
   GEMINI_API_KEY="TU_GEMINI_API_KEY_AQUI"

   # URL Base de tu App (local o desplegada)
   APP_URL="http://localhost:3000"

   # Credenciales de conexión para la aplicación
   SQL_HOST="localhost"
   SQL_DB_NAME="nombre_de_tu_base_de_datos"
   SQL_USER="usuario_de_postgres"
   SQL_PASSWORD="password_de_postgres"

   # Credenciales de administrador (Usadas por Drizzle Kit para crear tablas)
   SQL_ADMIN_USER="usuario_de_postgres"
   SQL_ADMIN_PASSWORD="password_de_postgres"
   ```

---

## 📦 Instalación de Dependencias

Ejecuta el siguiente comando en la raíz del proyecto para instalar todas las dependencias requeridas:

```bash
npm install
```

---

## 🗄️ Inicializar la Base de Datos (Tablas y Esquema)

Para crear automáticamente las tablas del sistema en tu base de datos local usando Drizzle ORM, ejecuta:

```bash
npx drizzle-kit push
```

Este comando leerá las definiciones de `/src/db/schema.ts` y sincronizará de forma instantánea el esquema en tu base de datos de PostgreSQL.

---

## 🏃‍♂️ Ejecutar la Aplicación

### Modo Desarrollo (Vite HMR + Express server)
Para arrancar el servidor backend y el frontend en modo de desarrollo con recarga automática:

```bash
npm run dev
```
La aplicación estará disponible en: **`http://localhost:3000`**

### Modo Producción (Compilación final)
Si deseas compilar la aplicación para producción de forma optimizada:

1. **Compilar el proyecto**:
   ```bash
   npm run build
   ```
2. **Arrancar en producción**:
   ```bash
   npm start
   ```

---

## 📂 Estructura del Código

- `/server.ts`: Servidor backend Express que maneja las rutas de la API, la lógica del servidor y sirve los recursos del cliente.
- `/src/App.tsx`: Layout principal del Workspace de la aplicación con la barra lateral de navegación y ruteo de componentes.
- `/src/components/`:
  - `InventoryView.tsx`: Módulo de gestión de inventarios y detalles/historiales de vehículos.
  - `SalesView.tsx`: Módulo de registro y simulación de transacciones de venta.
  - `ReportsView.tsx`: Informes de ventas históricos, ingresos, métricas de vendedores y bento-grid.
  - `UsersView.tsx`: Panel administrativo de roles y usuarios.
  - `LoginView.tsx`: Pantalla de bienvenida y control de accesos de usuarios de prueba.
- `/src/db/`:
  - `schema.ts`: Definición de las tablas e índices de la base de datos PostgreSQL.
  - `index.ts`: Inicialización del pool de conexión de Drizzle.
