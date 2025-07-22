/**
 * Vision Management Routes
 * Handles creation, retrieval, update, and approval of strategic visions
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { asyncHandler, errors, ApiError } from '../../../shared/middleware/src/errorHandler.js';
import { PERMISSIONS } from '../../../shared/auth/src/permissions.js';
import VisionService from '../services/visionService.js';

export default (server) => {
  const router = express.Router();
  const visionService = new VisionService(server);

  // Validation middleware
  const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('VALIDATION_ERROR', 'Validation failed', 400, {
        errors: errors.array()
      });
    }
    next();
  };

  /**
   * POST /visions - Create a new vision
   */
  router.post('/',
    server.jwtManager.middleware({ required: true }),
    server.permissionManager.requirePermissions(PERMISSIONS.VISION_CREATE),
    [
      body('title').notEmpty().trim().isLength({ min: 3, max: 200 }),
      body('description').notEmpty().trim().isLength({ min: 10, max: 5000 }),
      body('strategic_goals').isArray({ min: 1 }).withMessage('At least one strategic goal required'),
      body('strategic_goals.*').isString().trim().notEmpty(),
      body('timeline_months').isInt({ min: 1, max: 120 }).withMessage('Timeline must be between 1-120 months'),
      body('budget_usd').optional().isInt({ min: 0 }),
      body('stakeholders').optional().isArray(),
      body('stakeholders.*').isEmail(),
      body('priority').optional().isIn(['low', 'medium', 'high', 'critical'])
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
      const vision = await visionService.createVision({
        ...req.body,
        created_by: req.auth.sub,
        request_id: req.id
      });

      res.status(201).json(vision);
    })
  );

  /**
   * GET /visions - List visions
   */
  router.get('/',
    server.jwtManager.middleware({ required: true }),
    server.permissionManager.requirePermissions(PERMISSIONS.VISION_READ),
    [
      query('status').optional().isIn(['draft', 'pending_approval', 'approved', 'rejected', 'archived']),
      query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('sort').optional().isIn(['created_at', 'updated_at', 'priority', 'timeline_months']),
      query('order').optional().isIn(['asc', 'desc'])
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
      const options = {
        status: req.query.status,
        priority: req.query.priority,
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        sort: req.query.sort || 'created_at',
        order: req.query.order || 'desc'
      };

      const result = await visionService.listVisions(options);
      res.json(result);
    })
  );

  /**
   * GET /visions/:id - Get a specific vision
   */
  router.get('/:id',
    server.jwtManager.middleware({ required: true }),
    server.permissionManager.requirePermissions(PERMISSIONS.VISION_READ),
    [
      param('id').notEmpty().trim()
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
      const vision = await visionService.getVision(req.params.id);
      
      if (!vision) {
        throw errors.notFound('Vision');
      }

      res.json(vision);
    })
  );

  /**
   * PUT /visions/:id - Update a vision
   */
  router.put('/:id',
    server.jwtManager.middleware({ required: true }),
    server.permissionManager.requirePermissions(PERMISSIONS.VISION_UPDATE),
    [
      param('id').notEmpty().trim(),
      body('title').optional().trim().isLength({ min: 3, max: 200 }),
      body('description').optional().trim().isLength({ min: 10, max: 5000 }),
      body('strategic_goals').optional().isArray({ min: 1 }),
      body('strategic_goals.*').optional().isString().trim().notEmpty(),
      body('timeline_months').optional().isInt({ min: 1, max: 120 }),
      body('budget_usd').optional().isInt({ min: 0 }),
      body('stakeholders').optional().isArray(),
      body('stakeholders.*').optional().isEmail(),
      body('priority').optional().isIn(['low', 'medium', 'high', 'critical'])
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
      const vision = await visionService.updateVision(req.params.id, {
        ...req.body,
        updated_by: req.auth.sub,
        request_id: req.id
      });

      if (!vision) {
        throw errors.notFound('Vision');
      }

      res.json(vision);
    })
  );

  /**
   * PUT /visions/:id/approve - Approve a vision
   */
  router.put('/:id/approve',
    server.jwtManager.middleware({ required: true }),
    server.permissionManager.requirePermissions(PERMISSIONS.VISION_APPROVE),
    [
      param('id').notEmpty().trim(),
      body('approver_email').isEmail(),
      body('approval_notes').optional().trim().isLength({ max: 1000 }),
      body('conditions').optional().isArray(),
      body('conditions.*').optional().isString().trim()
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
      const result = await visionService.approveVision(req.params.id, {
        approver_email: req.body.approver_email,
        approval_notes: req.body.approval_notes,
        conditions: req.body.conditions,
        approved_by: req.auth.sub,
        request_id: req.id
      });

      if (!result) {
        throw errors.notFound('Vision');
      }

      res.json(result);
    })
  );

  /**
   * PUT /visions/:id/reject - Reject a vision
   */
  router.put('/:id/reject',
    server.jwtManager.middleware({ required: true }),
    server.permissionManager.requirePermissions(PERMISSIONS.VISION_APPROVE),
    [
      param('id').notEmpty().trim(),
      body('rejection_reason').notEmpty().trim().isLength({ min: 10, max: 1000 }),
      body('feedback').optional().trim()
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
      const result = await visionService.rejectVision(req.params.id, {
        rejection_reason: req.body.rejection_reason,
        feedback: req.body.feedback,
        rejected_by: req.auth.sub,
        request_id: req.id
      });

      if (!result) {
        throw errors.notFound('Vision');
      }

      res.json(result);
    })
  );

  /**
   * DELETE /visions/:id - Archive a vision
   */
  router.delete('/:id',
    server.jwtManager.middleware({ required: true }),
    server.permissionManager.requirePermissions(PERMISSIONS.VISION_DELETE),
    [
      param('id').notEmpty().trim()
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
      const result = await visionService.archiveVision(req.params.id, {
        archived_by: req.auth.sub,
        request_id: req.id
      });

      if (!result) {
        throw errors.notFound('Vision');
      }

      res.status(204).send();
    })
  );

  return router;
};