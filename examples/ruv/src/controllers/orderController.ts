import { Request, Response } from 'express';
import { db } from '../models/database';
import { ApiResponse, Order } from '../types';

export const getAllOrders = async (_req: Request, res: Response<ApiResponse<Order[]>>) => {
  try {
    const orders = db.getAllOrders();
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
};

export const getOrderById = async (req: Request, res: Response<ApiResponse<Order>>) => {
  try {
    const order = db.getOrderById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }
    
    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
    });
  }
};

export const getOrdersByUserId = async (req: Request, res: Response<ApiResponse<Order[]>>) => {
  try {
    const orders = db.getOrdersByUserId(req.params.userId);
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user orders',
    });
  }
};

export const createOrder = async (req: Request, res: Response<ApiResponse<Order>>) => {
  try {
    const { userId, products, status = 'pending' } = req.body;
    
    if (!userId || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'UserId and products array are required',
      });
    }
    
    const total = products.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    const newOrder = db.createOrder({ userId, products, total, status });
    
    return res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create order',
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response<ApiResponse<Order>>) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
      });
    }
    
    const updatedOrder = db.updateOrder(req.params.id, { status });
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }
    
    return res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update order',
    });
  }
};

export const deleteOrder = async (req: Request, res: Response<ApiResponse<void>>) => {
  try {
    const deleted = db.deleteOrder(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }
    
    return res.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete order',
    });
  }
};