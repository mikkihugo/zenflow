/**
 * Roadmap Routes
 * Handles roadmap generation and management for approved visions
 */

import express from 'express';
import { param, body, validationResult } from 'express-validator';
import { asyncHandler, errors, ApiError } from '../../../shared/middleware/src/errorHandler.js';
import { PERMISSIONS } from '../../../shared/auth/src/permissions.js';
import RoadmapService from '../services/roadmapService.js';

export default (server) => {
  const router = express.Router();
  const roadmapService = new RoadmapService(server);

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
   * GET /visions/:id/roadmap - Get roadmap for a vision
   */
  router.get('/:id/roadmap',
    server.jwtManager.middleware({ required: true }),
    server.permissionManager.requirePermissions(PERMISSIONS.VISION_READ),
    [
      param('id').notEmpty().trim()
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
      const roadmap = await roadmapService.getRoadmap(req.params.id);
      
      if (!roadmap) {
        throw errors.notFound('Roadmap');
      }

      res.json(roadmap);
    })
  );

  /**
   * POST /visions/:id/roadmap/generate - Generate or regenerate roadmap
   */
  router.post('/:id/roadmap/generate',
    server.jwtManager.middleware({ required: true }),
    server.permissionManager.requirePermissions(PERMISSIONS.VISION_UPDATE),
    [
      param('id').notEmpty().trim(),
      body('force').optional().isBoolean(),
      body('optimization_focus').optional().isIn(['speed', 'quality', 'cost', 'balanced'])
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
      const roadmap = await roadmapService.generateRoadmap(req.params.id, {
        force: req.body.force || false,
        optimization_focus: req.body.optimization_focus || 'balanced',
        requested_by: req.auth.sub,
        request_id: req.id
      });

      if (!roadmap) {
        throw errors.notFound('Vision');
      }

      res.status(201).json(roadmap);
    })
  );

  /**
   * PUT /visions/:id/roadmap - Update roadmap
   */
  router.put('/:id/roadmap',
    server.jwtManager.middleware({ required: true }),
    server.permissionManager.requirePermissions(PERMISSIONS.VISION_UPDATE),
    [
      param('id').notEmpty().trim(),
      body('phases').optional().isArray(),
      body('phases.*.name').optional().notEmpty().trim(),
      body('phases.*.duration_weeks').optional().isInt({ min: 1 }),
      body('phases.*.features').optional().isArray(),
      body('dependencies').optional().isObject(),
      body('risk_mitigation').optional().isObject()
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
      const roadmap = await roadmapService.updateRoadmap(req.params.id, {
        ...req.body,
        updated_by: req.auth.sub,
        request_id: req.id
      });

      if (!roadmap) {
        throw errors.notFound('Roadmap');
      }

      res.json(roadmap);
    })
  );

  /**
   * POST /visions/:id/roadmap/phases/:phaseId/complete - Mark phase as complete
   */
  router.post('/:id/roadmap/phases/:phaseId/complete',
    server.jwtManager.middleware({ required: true }),
    server.permissionManager.requirePermissions(PERMISSIONS.VISION_UPDATE),
    [
      param('id').notEmpty().trim(),
      param('phaseId').isInt(),
      body('completion_notes').optional().trim(),
      body('actual_duration_weeks').optional().isInt({ min: 1 }),
      body('delivered_features').optional().isArray()
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
      const result = await roadmapService.completePhase(
        req.params.id,
        parseInt(req.params.phaseId),
        {
          completion_notes: req.body.completion_notes,
          actual_duration_weeks: req.body.actual_duration_weeks,
          delivered_features: req.body.delivered_features,
          completed_by: req.auth.sub,
          request_id: req.id
        }
      );

      if (!result) {
        throw errors.notFound('Phase');
      }

      res.json(result);
    })
  );

  /**
   * GET /visions/:id/roadmap/progress - Get roadmap progress
   */
  router.get('/:id/roadmap/progress',
    server.jwtManager.middleware({ required: true }),
    server.permissionManager.requirePermissions(PERMISSIONS.VISION_READ),
    [
      param('id').notEmpty().trim()
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
      const progress = await roadmapService.getRoadmapProgress(req.params.id);
      
      if (!progress) {
        throw errors.notFound('Roadmap');
      }

      res.json(progress);
    })
  );

  return router;
};