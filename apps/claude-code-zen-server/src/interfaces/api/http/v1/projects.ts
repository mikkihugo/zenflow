/**
 * Projects API v1 Routes.
 *
 * REST API routes for project management and switching.
 * Enables seamless project switching in the web interface.
 *
 * @file Project management API routes.
 */

import {
  getRegisteredProjects,
  getCurrentProject,
  getDataStoragePaths,
  cleanupProjectRegistry,
} from '@claude-zen/intelligence');
import { type Request, type Response, Router } from 'express');

import {
  getProjectModeManager,
  ProjectMode,
} from './../../../core/project-mode-manager');
import { ProjectSwitcher } from './../../../core/project-switcher');
import { asyncHandler } from './middleware/errors');
import { LogLevel, log } from './middleware/logging');

/**
 * Create project management routes.
 * All project endpoints under /api/v1/projects.
 */
export const createProjectRoutes = (): Router => {
  const router = Router();
  const projectSwitcher = new ProjectSwitcher();
  const projectModeManager = getProjectModeManager();

  // ===== PROJECT LISTING =====

  /**
   * GET /api/v1/projects.
   * List all registered projects with metadata.
   */
  router.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Listing all projects', req);

      const projects = getRegisteredProjects();
      const currentProject = getCurrentProject();

      const result = {
        projects: projects.map((project) => ({
          ...project,
          isCurrent: project.id === currentProject.id,
          status: project.id === currentProject.id ? 'active : inactive',
        })),
        total: projects.length,
        currentProject: currentProject.id,
        mode: currentProject.mode,
      };

      log(LogLevel.DEBUG, 'Projects listed successfully', req, {
        total: result.total,
        currentProject: result.currentProject,
      });

      res.json(result);
    })
  );

  /**
   * GET /api/v1/projects/current.
   * Get currently active project information.
   */
  router.get(
    '/current',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting current project', req);

      const currentProject = getCurrentProject();
      const dataPaths = getDataStoragePaths();

      const result = {
        ...currentProject,
        status: 'active',
        dataPaths: {
          dataDir: dataPaths.dataDir,
          memoryDir: dataPaths.memoryDir,
          swarmDir: dataPaths.swarmDir,
          neuralDir: dataPaths.neuralDir,
          cacheDir: dataPaths.cacheDir,
          logsDir: dataPaths.logsDir,
        },
        lastAccessed: new Date()?.toISOString,
      };

      res.json(result);
    })
  );

  /**
   * GET /api/v1/projects/:projectId.
   * Get specific project details by ID.
   */
  router.get(
    '/:projectId',
    asyncHandler(async (req: Request, res: Response) => {
      const projectId = req.params.projectId;

      log(LogLevel.DEBUG, 'Getting project details', req, {
        projectId,
      });

      const projects = getRegisteredProjects();
      const project = projects.find((p) => p.id === projectId);
      const currentProject = getCurrentProject();

      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          message: `Project with ID '${projectId}' does not exist`,
          availableProjects: projects.map((p) => p.id),
        });
      }

      const result = {
        ...project,
        isCurrent: project.id === currentProject.id,
        status: project.id === currentProject.id ? 'active : inactive',
      };

      res.json(result);
    })
  );

  // ===== PROJECT SWITCHING =====

  /**
   * POST /api/v1/projects/switch.
   * Switch to a different project with graceful shutdown/restart.
   */
  router.post(
    '/switch',
    asyncHandler(async (req: Request, res: Response) => {
      const { projectId, projectPath } = req.body;

      if (!projectId && !projectPath) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Either projectId or projectPath must be provided',
        });
      }

      log(LogLevel.INFO, 'Initiating project switch', req, {
        projectId,
        projectPath: projectPath ? '[provided] : [from registry]',
      });

      try {
        const result = await projectSwitcher.switchToProject({
          projectId,
          projectPath,
        });

        log(LogLevel.INFO, 'Project switch completed successfully', req, {
          newProjectId: result.projectId,
          previousProject: result.previousProject,
        });

        res.json(result);
      } catch (error) {
        log(LogLevel.ERROR, 'Project switch failed', req, {
          projectId,
          error: (error as Error).message,
        });

        res.status(500).json({
          error: 'Project Switch Failed',
          message: (error as Error).message,
          projectId,
        });
      }
    })
  );

  /**
   * POST /api/v1/projects/:projectId/switch.
   * Switch to specific project by ID.
   */
  router.post(
    '/:projectId/switch',
    asyncHandler(async (req: Request, res: Response) => {
      const projectId = req.params.projectId;

      log(LogLevel.INFO, 'Switching to project by ID', req, {
        projectId,
      });

      // Verify project exists
      const projects = getRegisteredProjects();
      const project = projects.find((p) => p.id === projectId);

      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          message: `Project with ID '${projectId}' does not exist`,
          availableProjects: projects.map((p) => p.id),
        });
      }

      try {
        const result = await projectSwitcher.switchToProject({
          projectId,
          projectPath: project.path,
        });

        log(LogLevel.INFO, 'Project switch by ID completed', req, {
          projectId: result.projectId,
          projectName: result.projectName,
        });

        res.json(result);
      } catch (error) {
        log(LogLevel.ERROR, 'Project switch by ID failed', req, {
          projectId,
          error: (error as Error).message,
        });

        res.status(500).json({
          error: 'Project Switch Failed',
          message: (error as Error).message,
          projectId,
        });
      }
    })
  );

  // ===== PROJECT MANAGEMENT =====

  /**
   * POST /api/v1/projects/cleanup.
   * Clean up project registry (remove invalid projects).
   */
  router.post(
    '/cleanup',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.INFO, 'Cleaning up project registry', req);

      try {
        cleanupProjectRegistry();
        const projects = getRegisteredProjects();

        log(LogLevel.INFO, 'Project registry cleaned successfully', req, {
          remainingProjects: projects.length,
        });

        res.json({
          message: 'Project registry cleaned successfully',
          remainingProjects: projects.length,
          projects: projects.map((p) => ({
            id: p.id,
            name: p.name,
            path: p.path,
          })),
        });
      } catch (error) {
        log(LogLevel.ERROR, 'Project registry cleanup failed', req, {
          error: (error as Error).message,
        });

        res.status(500).json({
          error: 'Cleanup Failed',
          message: (error as Error).message,
        });
      }
    })
  );

  /**
   * GET /api/v1/projects/status.
   * Get overall project system status.
   */
  router.get(
    '/status',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting project system status', req);

      const projects = getRegisteredProjects();
      const currentProject = getCurrentProject();
      const switcherStatus = projectSwitcher?.getStatus()

      const result = {
        totalProjects: projects.length,
        currentProject: {
          id: currentProject.id,
          name: currentProject.name,
          mode: currentProject.mode,
        },
        switcher: {
          status: switcherStatus.status,
          isSwitching: switcherStatus.isSwitching,
          lastSwitch: switcherStatus.lastSwitch,
        },
        systemHealth: 'healthy', // This could be enhanced with actual health checks
      };

      res.json(result);
    })
  );

  // ===== PROJECT MODE MANAGEMENT =====

  /**
   * GET /api/v1/projects/:projectId/modes.
   * Get available project modes and current mode for a project.
   */
  router.get(
    '/:projectId/modes',
    asyncHandler(async (req: Request, res: Response) => {
      const { projectId } = req.params;

      log(LogLevel.DEBUG, 'Getting project modes', req, { projectId });

      try {
        // Get current project mode (for now, default to KANBAN, later get from project metadata)
        const currentMode = ProjectMode.KANBAN; // TODO: Get from project config/database

        const availableModes =
          projectModeManager.getAvailableModes(currentMode);
        const capabilities =
          projectModeManager.getModeCapabilities(currentMode);
        const config = projectModeManager.getModeConfig(currentMode);

        const result = {
          projectId,
          currentMode,
          availableModes,
          capabilities,
          config: {
            schemaVersion: config?.schemaVersion,
            settings: config?.settings,
            migration: config?.migration,
          },
        };

        log(LogLevel.DEBUG, 'Project modes retrieved successfully', req, {
          projectId,
          currentMode,
          availableCount: availableModes.length,
        });

        res.json(result);
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to get project modes', req, {
          projectId,
          error: (error as Error).message,
        });

        res.status(500).json({
          error: 'Failed to get project modes',
          message: (error as Error).message,
        });
      }
    })
  );

  /**
   * GET /api/v1/projects/modes/:mode/capabilities.
   * Get mode capabilities for a specific mode.
   */
  router.get(
    '/modes/:mode/capabilities',
    asyncHandler(async (req: Request, res: Response) => {
      const { mode } = req.params;

      log(LogLevel.DEBUG, 'Getting mode capabilities', req, { mode });

      try {
        const projectMode = mode as ProjectMode;
        const capabilities =
          projectModeManager.getModeCapabilities(projectMode);
        const config = projectModeManager.getModeConfig(projectMode);

        if (!capabilities || !config) {
          return res.status(404).json({
            error: 'Mode not found',
            message: `Mode '${mode}' does not exist`,
            availableModes: Object.values()(ProjectMode),
          });
        }

        const result = {
          mode: projectMode,
          capabilities,
          config: {
            schemaVersion: config.schemaVersion,
            settings: config.settings,
            migration: config.migration,
          },
          description: getModeDescription(projectMode),
        };

        res.json(result);
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to get mode capabilities', req, {
          mode,
          error: (error as Error).message,
        });

        res.status(500).json({
          error: 'Failed to get mode capabilities',
          message: (error as Error).message,
        });
      }
    })
  );

  /**
   * POST /api/v1/projects/:projectId/modes/upgrade.
   * Upgrade project mode with schema migration.
   */
  router.post(
    '/:projectId/modes/upgrade',
    asyncHandler(async (req: Request, res: Response) => {
      const { projectId } = req.params;
      const {
        toMode,
        preserveData = true,
        backupBeforeMigration = true,
        validateAfterMigration = true,
      } = req.body;

      if (!toMode) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Target mode (toMode) is required',
        });
      }

      log(LogLevel.INFO, 'Initiating project mode upgrade', req, {
        projectId,
        toMode,
        preserveData,
        backupBeforeMigration,
        validateAfterMigration,
      });

      try {
        // Get current project mode (for now, default to KANBAN)
        const fromMode = ProjectMode.KANBAN; // TODO: Get from project config/database

        // Check if upgrade is possible
        if (!projectModeManager.canUpgradeMode(fromMode, toMode)) {
          return res.status(400).json({
            error: 'Upgrade not allowed',
            message: `Cannot upgrade from ${fromMode} to ${toMode}`,
            currentMode: fromMode,
            targetMode: toMode,
          });
        }

        const result = await projectModeManager.upgradeProjectMode(
          projectId,
          fromMode,
          toMode,
          {
            preserveData,
            backupBeforeMigration,
            validateAfterMigration,
          }
        );

        log(LogLevel.INFO, 'Project mode upgrade completed', req, {
          projectId,
          fromMode,
          toMode,
          success: result.success,
          migrationSteps: result.migrationLog.length,
        });

        res.json({
          projectId,
          fromMode,
          toMode,
          ...result,
        });
      } catch (error) {
        log(LogLevel.ERROR, 'Project mode upgrade failed', req, {
          projectId,
          toMode,
          error: (error as Error).message,
        });

        res.status(500).json({
          error: 'Mode upgrade failed',
          message: (error as Error).message,
          projectId,
          targetMode: toMode,
        });
      }
    })
  );

  /**
   * GET /api/v1/projects/:projectId/modes/upgrade-paths.
   * Get available upgrade paths for a project.
   */
  router.get(
    '/:projectId/modes/upgrade-paths',
    asyncHandler(async (req: Request, res: Response) => {
      const { projectId } = req.params;

      log(LogLevel.DEBUG, 'Getting project upgrade paths', req, { projectId });

      try {
        // Get current project mode (for now, default to KANBAN)
        const currentMode = ProjectMode.KANBAN; // TODO: Get from project config/database

        const config = projectModeManager.getModeConfig(currentMode);

        if (!config) {
          return res.status(404).json({
            error: 'Current mode configuration not found',
            message: `Current mode '${currentMode}' configuration not found`,
          });
        }

        const result = {
          projectId,
          currentMode,
          upgradeableTo: config.migration.upgradeableTo,
          downgradeableTo: config.migration.downgradeableTo,
          migrationRequired: config.migration.migrationRequired,
          currentSchemaVersion: config.schemaVersion,
        };

        res.json(result);
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to get upgrade paths', req, {
          projectId,
          error: (error as Error).message,
        });

        res.status(500).json({
          error: 'Failed to get upgrade paths',
          message: (error as Error).message,
        });
      }
    })
  );

  /**
   * GET /api/v1/projects/schema/migration-path.
   * Get schema migration path between versions.
   */
  router.get(
    '/schema/migration-path',
    asyncHandler(async (req: Request, res: Response) => {
      const { fromVersion, toVersion } = req.query;

      if (!fromVersion || !toVersion) {
        return res.status(400).json({
          error: 'Bad Request',
          message:
            'Both fromVersion and toVersion query parameters are required',
        });
      }

      log(LogLevel.DEBUG, 'Getting schema migration path', req, {
        fromVersion,
        toVersion,
      });

      try {
        const migrationPath = projectModeManager.getSchemaMigrationPath(
          fromVersion as string,
          toVersion as string
        );

        const result = {
          fromVersion,
          toVersion,
          migrationPath,
          totalSteps: migrationPath.length,
          hasPath: migrationPath.length > 0,
        };

        res.json(result);
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to get migration path', req, {
          fromVersion,
          toVersion,
          error: (error as Error).message,
        });

        res.status(500).json({
          error: 'Failed to get migration path',
          message: (error as Error).message,
        });
      }
    })
  );

  /**
   * GET /api/v1/projects/modes.
   * Get all available project modes.
   */
  router.get(
    '/modes',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting all available project modes', req);

      try {
        const modes = Object.values()(ProjectMode);
        const modeDetails = modes.map((mode) => {
          const capabilities = projectModeManager.getModeCapabilities(mode);
          const config = projectModeManager.getModeConfig(mode);
          return {
            mode,
            capabilities,
            schemaVersion: config?.schemaVersion,
            description: getModeDescription(mode),
            settings: config?.settings,
            migration: config?.migration,
          };
        });

        const result = {
          modes: modeDetails,
          total: modes.length,
          defaultMode: ProjectMode.KANBAN,
        };

        log(LogLevel.DEBUG, 'Available modes retrieved successfully', req, {
          total: modes.length,
        });

        res.json(result);
      } catch (error) {
        log(LogLevel.ERROR, 'Failed to get available modes', req, {
          error: (error as Error).message,
        });

        res.status(500).json({
          error: 'Failed to get available modes',
          message: (error as Error).message,
        });
      }
    })
  );

  return router;
};

/**
 * Helper function to get mode descriptions.
 */
function getModeDescription(mode: ProjectMode): string {
  switch (mode) {
    case ProjectMode.KANBAN:
      return 'Kanban workflow engine with continuous flow, WIP limits, and flow metrics. Schema v1..0+.');
    // TODO: Add when Agile mode is implemented
    // case ProjectMode.AGILE:
    //   return 'Kanban + Sprint-based development with backlog management and retrospectives');
    // TODO: Add when SAFe mode is implemented
    // case ProjectMode.SAFE:
    //   return 'Kanban + Agile + Scaled enterprise framework with Program Increments, ARTs, and Value Streams');
    default:
      return 'Unknown project mode');
  }
}

/**
 * Default export for the project routes.
 */
export default createProjectRoutes;
