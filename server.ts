import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import * as schema from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import { INITIAL_USERS, INITIAL_VEHICLES, INITIAL_SALES, INITIAL_ALERTS, INITIAL_LOGS } from './src/data/mockData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- SEED DATABASE IF EMPTY ---
  try {
    const existingUsers = await db.select().from(schema.users).limit(1);
    if (existingUsers.length === 0) {
      console.log('PostgreSQL database is empty. Seeding initial data...');
      
      // Seed Users
      for (const user of INITIAL_USERS) {
        await db.insert(schema.users).values({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          active: user.active,
          avatarColor: user.avatarColor,
        });
      }

      // Seed Vehicles & history events
      for (const vehicle of INITIAL_VEHICLES) {
        await db.insert(schema.vehicles).values({
          id: vehicle.id,
          vin: vehicle.vin,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          price: vehicle.price,
          originalPrice: vehicle.originalPrice,
          mileage: vehicle.mileage,
          color: vehicle.color,
          transmission: vehicle.transmission,
          fuel: vehicle.fuel,
          type: vehicle.type,
          status: vehicle.status,
          image: vehicle.image,
          createdAt: vehicle.createdAt,
        });

        if (vehicle.history && vehicle.history.length > 0) {
          for (const event of vehicle.history) {
            await db.insert(schema.historyEvents).values({
              id: event.id,
              vehicleId: vehicle.id,
              date: event.date,
              type: event.type,
              title: event.title,
              description: event.description,
              cost: event.cost || null,
              performedBy: event.performedBy,
            });
          }
        }
      }

      // Seed Sales
      for (const sale of INITIAL_SALES) {
        await db.insert(schema.sales).values({
          id: sale.id,
          vehicleId: sale.vehicleId,
          vehicleName: sale.vehicleName,
          salePrice: sale.salePrice,
          sellerId: sale.sellerId,
          sellerName: sale.sellerName,
          buyerName: sale.buyerName,
          buyerDni: sale.buyerDni,
          buyerPhone: sale.buyerPhone,
          buyerEmail: sale.buyerEmail,
          date: sale.date,
          paymentMethod: sale.paymentMethod,
        });
      }

      // Seed Stock Alerts
      for (const alert of INITIAL_ALERTS) {
        await db.insert(schema.stockAlerts).values({
          id: alert.id,
          vehicleType: alert.vehicleType,
          threshold: alert.threshold,
          currentStock: alert.currentStock,
          isActive: alert.isActive,
        });
      }

      // Seed Logs
      for (const log of INITIAL_LOGS) {
        await db.insert(schema.systemLogs).values({
          id: log.id,
          timestamp: log.timestamp,
          userId: log.userId,
          userName: log.userName,
          userRole: log.userRole,
          action: log.action,
          details: log.details,
          category: log.category,
        });
      }

      console.log('Seeding completed successfully!');
    } else {
      console.log('Database already has data. Skipping seed.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }

  // --- API ROUTES ---

  // USERS
  app.get('/api/users', async (req, res) => {
    try {
      const result = await db.select().from(schema.users);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch users', details: err.message });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const newUser = req.body;
      await db.insert(schema.users).values(newUser);
      res.status(201).json(newUser);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create user', details: err.message });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      await db.update(schema.users).set(updates).where(eq(schema.users.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update user', details: err.message });
    }
  });

  // VEHICLES & HISTORY
  app.get('/api/vehicles', async (req, res) => {
    try {
      const vehiclesList = await db.select().from(schema.vehicles);
      const eventsList = await db.select().from(schema.historyEvents);

      // Group history events by vehicleId
      const groupedVehicles = vehiclesList.map(vehicle => {
        const history = eventsList.filter(event => event.vehicleId === vehicle.id);
        return {
          ...vehicle,
          history,
        };
      });

      res.json(groupedVehicles);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch vehicles', details: err.message });
    }
  });

  app.post('/api/vehicles', async (req, res) => {
    try {
      const { history, ...vehicleData } = req.body;
      await db.insert(schema.vehicles).values(vehicleData);
      
      if (history && Array.isArray(history)) {
        for (const event of history) {
          await db.insert(schema.historyEvents).values({
            ...event,
            vehicleId: vehicleData.id,
          });
        }
      }

      res.status(201).json(req.body);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create vehicle', details: err.message });
    }
  });

  app.put('/api/vehicles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { history, ...vehicleData } = req.body;
      
      await db.update(schema.vehicles).set(vehicleData).where(eq(schema.vehicles.id, id));
      
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update vehicle', details: err.message });
    }
  });

  app.delete('/api/vehicles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(schema.vehicles).where(eq(schema.vehicles.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete vehicle', details: err.message });
    }
  });

  app.post('/api/vehicles/:id/history', async (req, res) => {
    try {
      const { id } = req.params;
      const event = req.body;
      await db.insert(schema.historyEvents).values({
        ...event,
        vehicleId: id,
      });
      res.status(201).json(event);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to add history event', details: err.message });
    }
  });

  // SALES
  app.get('/api/sales', async (req, res) => {
    try {
      const result = await db.select().from(schema.sales);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch sales', details: err.message });
    }
  });

  app.post('/api/sales', async (req, res) => {
    try {
      const newSale = req.body;
      await db.insert(schema.sales).values(newSale);
      res.status(201).json(newSale);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to register sale', details: err.message });
    }
  });

  // ALERTS
  app.get('/api/alerts', async (req, res) => {
    try {
      const result = await db.select().from(schema.stockAlerts);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch alerts', details: err.message });
    }
  });

  app.put('/api/alerts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      await db.update(schema.stockAlerts).set(updates).where(eq(schema.stockAlerts.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update alert', details: err.message });
    }
  });

  // SYSTEM LOGS
  app.get('/api/logs', async (req, res) => {
    try {
      const result = await db.select().from(schema.systemLogs);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch logs', details: err.message });
    }
  });

  app.post('/api/logs', async (req, res) => {
    try {
      const newLog = req.body;
      await db.insert(schema.systemLogs).values(newLog);
      res.status(201).json(newLog);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to log action', details: err.message });
    }
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
