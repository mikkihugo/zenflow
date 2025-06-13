import { Router } from 'express';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import orderRoutes from './orderRoutes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to RUV REST API',
    version: '1.0.0',
    endpoints: {
      users: '/users',
      products: '/products',
      orders: '/orders',
    },
  });
});

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

export default router;