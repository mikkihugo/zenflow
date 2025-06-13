import { Request, Response } from 'express';
import { db } from '../models/database';
import { ApiResponse, Product } from '../types';

export const getAllProducts = async (_req: Request, res: Response<ApiResponse<Product[]>>) => {
  try {
    const products = db.getAllProducts();
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
    });
  }
};

export const getProductById = async (req: Request, res: Response<ApiResponse<Product>>) => {
  try {
    const product = db.getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
    });
  }
};

export const createProduct = async (req: Request, res: Response<ApiResponse<Product>>) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    if (!name || !description || price === undefined || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'All product fields are required',
      });
    }
    
    const newProduct = db.createProduct({ name, description, price, category, stock });
    
    return res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create product',
    });
  }
};

export const updateProduct = async (req: Request, res: Response<ApiResponse<Product>>) => {
  try {
    const updatedProduct = db.updateProduct(req.params.id, req.body);
    
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    return res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update product',
    });
  }
};

export const deleteProduct = async (req: Request, res: Response<ApiResponse<void>>) => {
  try {
    const deleted = db.deleteProduct(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    return res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete product',
    });
  }
};