import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController';

const router = Router();

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.get('/user/:userId', getOrdersByUserId);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;