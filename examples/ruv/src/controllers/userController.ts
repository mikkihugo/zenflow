import { Request, Response } from 'express';
import { db } from '../models/database';
import { ApiResponse, User } from '../types';

export const getAllUsers = async (_req: Request, res: Response<ApiResponse<User[]>>) => {
  try {
    const users = db.getAllUsers();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
};

export const getUserById = async (req: Request, res: Response<ApiResponse<User>>) => {
  try {
    const user = db.getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
    });
  }
};

export const createUser = async (req: Request, res: Response<ApiResponse<User>>) => {
  try {
    const { name, email, role } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and role are required',
      });
    }
    
    const newUser = db.createUser({ name, email, role });
    
    return res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create user',
    });
  }
};

export const updateUser = async (req: Request, res: Response<ApiResponse<User>>) => {
  try {
    const updatedUser = db.updateUser(req.params.id, req.body);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    return res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update user',
    });
  }
};

export const deleteUser = async (req: Request, res: Response<ApiResponse<void>>) => {
  try {
    const deleted = db.deleteUser(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    return res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete user',
    });
  }
};