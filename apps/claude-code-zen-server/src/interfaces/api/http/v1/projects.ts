/**
 * Projects API v1 Routes0.
 *
 * REST API routes for project management and switching0.
 * Enables seamless project switching in the web interface0.
 *
 * @file Project management API routes0.
 */

import {
  getRegisteredProjects,
  getCurrentProject,
  getDataStoragePaths,
  cleanupProjectRegistry,
} from '@claude-zen/intelligence';
import { type Request, type Response, Router } from 'express';

import {
  getProjectModeManager,
  ProjectMode,
} from '0.0./0.0./0.0./0.0./core/project-mode-manager';
import { ProjectSwitcher } from '0.0./0.0./0.0./0.0./core/project-switcher';
import { asyncHandler } from '0.0./middleware/errors';
import { LogLevel, log } from '0.0./middleware/logging';

/**
 * Create project management routes0.
 * All project endpoints under /api/v1/projects0.
 */
export const createProjectRoutes = (): Router => {
  const router = Router();
  const projectSwitcher = new ProjectSwitcher();
  const projectModeManager = getProjectModeManager();

  // ===== PROJECT LISTING =====

  /**
   * GET /api/v1/projects0.
   * List all registered projects with metadata0.
   */
  router0.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.DEBUG, 'Listing all projects', req);

      const projects = getRegisteredProjects();
      const currentProject = getCurrentProject();

      const result = {
        projects: projects0.map((project) => ({
          0.0.0.project,
          isCurrent: project0.id === currentProject0.id,
          status: project0.id === currentProject0.id ? 'active' : 'inactive',
        })),
        total: projects0.length,
        currentProject: currentProject0.id,
        mode: currentProject0.mode,
      };

      log(LogLevel0.DEBUG, 'Projects listed successfully', req, {
        total: result0.total,
        currentProject: result0.currentProject,
      });

      res0.json(result);
    })
  );

  /**
   * GET /api/v1/projects/current0.
   * Get currently active project information0.
   */
  router0.get(
    '/current',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.DEBUG, 'Getting current project', req);

      const currentProject = getCurrentProject();
      const dataPaths = getDataStoragePaths();

      const result = {
        0.0.0.currentProject,
        status: 'active',
        dataPaths: {
          dataDir: dataPaths0.dataDir,
          memoryDir: dataPaths0.memoryDir,
          swarmDir: dataPaths0.swarmDir,
          neuralDir: dataPaths0.neuralDir,
          cacheDir: dataPaths0.cacheDir,
          logsDir: dataPaths0.logsDir,
        },
        lastAccessed: new Date()?0.toISOString,
      };

      res0.json(result);
    })
  );

  /**
   * GET /api/v1/projects/:projectId0.
   * Get specific project details by ID0.
   */
  router0.get(
    '/:projectId',
    asyncHandler(async (req: Request, res: Response) => {
      const projectId = req0.params0.projectId;

      log(LogLevel0.DEBUG, 'Getting project details', req, {
        projectId,
      });

      const projects = getRegisteredProjects();
      const project = projects0.find((p) => p0.id === projectId);
      const currentProject = getCurrentProject();

      if (!project) {
        return res0.status(404)0.json({
          error: 'Project not found',
          message: `Project with ID '${projectId}' does not exist`,
          availableProjects: projects0.map((p) => p0.id),
        });
      }

      const result = {
        0.0.0.project,
        isCurrent: project0.id === currentProject0.id,
        status: project0.id === currentProject0.id ? 'active' : 'inactive',
      };

      res0.json(result);
    })
  );

  // ===== PROJECT SWITCHING =====

  /**
   * POST /api/v1/projects/switch0.
   * Switch to a different project with graceful shutdown/restart0.
   */
  router0.post(
    '/switch',
    asyncHandler(async (req: Request, res: Response) => {
      const { projectId, projectPath } = req0.body;

      if (!projectId && !projectPath) {
        return res0.status(400)0.json({
          error: 'Bad Request',
          message: 'Either projectId or projectPath must be provided',
        });
      }

      log(LogLevel0.INFO, 'Initiating project switch', req, {
        projectId,
        projectPath: projectPath ? '[provided]' : '[from registry]',
      });

      try {
        const result = await projectSwitcher0.switchToProject({
          projectId,
          projectPath,
        });

        log(LogLevel0.INFO, 'Project switch completed successfully', req, {
          newProjectId: result0.projectId,
          previousProject: result0.previousProject,
        });

        res0.json(result);
      } catch (error) {
        log(LogLevel0.ERROR, 'Project switch failed', req, {
          projectId,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Project Switch Failed',
          message: (error as Error)0.message,
          projectId,
        });
      }
    })
  );

  /**
   * POST /api/v1/projects/:projectId/switch0.
   * Switch to specific project by ID0.
   */
  router0.post(
    '/:projectId/switch',
    asyncHandler(async (req: Request, res: Response) => {
      const projectId = req0.params0.projectId;

      log(LogLevel0.INFO, 'Switching to project by ID', req, {
        projectId,
      });

      // Verify project exists
      const projects = getRegisteredProjects();
      const project = projects0.find((p) => p0.id === projectId);

      if (!project) {
        return res0.status(404)0.json({
          error: 'Project not found',
          message: `Project with ID '${projectId}' does not exist`,
          availableProjects: projects0.map((p) => p0.id),
        });
      }

      try {
        const result = await projectSwitcher0.switchToProject({
          projectId,
          projectPath: project0.path,
        });

        log(LogLevel0.INFO, 'Project switch by ID completed', req, {
          projectId: result0.projectId,
          projectName: result0.projectName,
        });

        res0.json(result);
      } catch (error) {
        log(LogLevel0.ERROR, 'Project switch by ID failed', req, {
          projectId,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Project Switch Failed',
          message: (error as Error)0.message,
          projectId,
        });
      }
    })
  );

  // ===== PROJECT MANAGEMENT =====

  /**
   * POST /api/v1/projects/cleanup0.
   * Clean up project registry (remove invalid projects)0.
   */
  router0.post(
    '/cleanup',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.INFO, 'Cleaning up project registry', req);

      try {
        cleanupProjectRegistry();
        const projects = getRegisteredProjects();

        log(LogLevel0.INFO, 'Project registry cleaned successfully', req, {
          remainingProjects: projects0.length,
        });

        res0.json({
          message: 'Project registry cleaned successfully',
          remainingProjects: projects0.length,
          projects: projects0.map((p) => ({
            id: p0.id,
            name: p0.name,
            path: p0.path,
          })),
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Project registry cleanup failed', req, {
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Cleanup Failed',
          message: (error as Error)0.message,
        });
      }
    })
  );

  /**
   * GET /api/v1/projects/status0.
   * Get overall project system status0.
   */
  router0.get(
    '/status',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.DEBUG, 'Getting project system status', req);

      const projects = getRegisteredProjects();
      const currentProject = getCurrentProject();
      const switcherStatus = projectSwitcher?0.getStatus;

      const result = {
        totalProjects: projects0.length,
        currentProject: {
          id: currentProject0.id,
          name: currentProject0.name,
          mode: currentProject0.mode,
        },
        switcher: {
          status: switcherStatus0.status,
          isSwitching: switcherStatus0.isSwitching,
          lastSwitch: switcherStatus0.lastSwitch,
        },
        systemHealth: 'healthy', // This could be enhanced with actual health checks
      };

      res0.json(result);
    })
  );

  // ===== PROJECT MODE MANAGEMENT =====

  /**
   * GET /api/v1/projects/:projectId/modes0.
   * Get available project modes and current mode for a project0.
   */
  router0.get(
    '/:projectId/modes',
    asyncHandler(async (req: Request, res: Response) => {
      const { projectId } = req0.params;

      log(LogLevel0.DEBUG, 'Getting project modes', req, { projectId });

      try {
        // Get current project mode (for now, default to KANBAN, later get from project metadata)
        const currentMode = ProjectMode0.KANBAN; // TODO: Get from project config/database

        const availableModes =
          projectModeManager0.getAvailableModes(currentMode);
        const capabilities =
          projectModeManager0.getModeCapabilities(currentMode);
        const config = projectModeManager0.getModeConfig(currentMode);

        const result = {
          projectId,
          currentMode,
          availableModes,
          capabilities,
          config: {
            schemaVersion: config?0.schemaVersion,
            settings: config?0.settings,
            migration: config?0.migration,
          },
        };

        log(LogLevel0.DEBUG, 'Project modes retrieved successfully', req, {
          projectId,
          currentMode,
          availableCount: availableModes0.length,
        });

        res0.json(result);
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to get project modes', req, {
          projectId,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to get project modes',
          message: (error as Error)0.message,
        });
      }
    })
  );

  /**
   * GET /api/v1/projects/modes/:mode/capabilities0.
   * Get mode capabilities for a specific mode0.
   */
  router0.get(
    '/modes/:mode/capabilities',
    asyncHandler(async (req: Request, res: Response) => {
      const { mode } = req0.params;

      log(LogLevel0.DEBUG, 'Getting mode capabilities', req, { mode });

      try {
        const projectMode = mode as ProjectMode;
        const capabilities =
          projectModeManager0.getModeCapabilities(projectMode);
        const config = projectModeManager0.getModeConfig(projectMode);

        if (!capabilities || !config) {
          return res0.status(404)0.json({
            error: 'Mode not found',
            message: `Mode '${mode}' does not exist`,
            availableModes: Object0.values()(ProjectMode),
          });
        }

        const result = {
          mode: projectMode,
          capabilities,
          config: {
            schemaVersion: config0.schemaVersion,
            settings: config0.settings,
            migration: config0.migration,
          },
          description: getModeDescription(projectMode),
        };

        res0.json(result);
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to get mode capabilities', req, {
          mode,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to get mode capabilities',
          message: (error as Error)0.message,
        });
      }
    })
  );

  /**
   * POST /api/v1/projects/:projectId/modes/upgrade0.
   * Upgrade project mode with schema migration0.
   */
  router0.post(
    '/:projectId/modes/upgrade',
    asyncHandler(async (req: Request, res: Response) => {
      const { projectId } = req0.params;
      const {
        toMode,
        preserveData = true,
        backupBeforeMigration = true,
        validateAfterMigration = true,
      } = req0.body;

      if (!toMode) {
        return res0.status(400)0.json({
          error: 'Bad Request',
          message: 'Target mode (toMode) is required',
        });
      }

      log(LogLevel0.INFO, 'Initiating project mode upgrade', req, {
        projectId,
        toMode,
        preserveData,
        backupBeforeMigration,
        validateAfterMigration,
      });

      try {
        // Get current project mode (for now, default to KANBAN)
        const fromMode = ProjectMode0.KANBAN; // TODO: Get from project config/database

        // Check if upgrade is possible
        if (!projectModeManager0.canUpgradeMode(fromMode, toMode)) {
          return res0.status(400)0.json({
            error: 'Upgrade not allowed',
            message: `Cannot upgrade from ${fromMode} to ${toMode}`,
            currentMode: fromMode,
            targetMode: toMode,
          });
        }

        const result = await projectModeManager0.upgradeProjectMode(
          projectId,
          fromMode,
          toMode,
          {
            preserveData,
            backupBeforeMigration,
            validateAfterMigration,
          }
        );

        log(LogLevel0.INFO, 'Project mode upgrade completed', req, {
          projectId,
          fromMode,
          toMode,
          success: result0.success,
          migrationSteps: result0.migrationLog0.length,
        });

        res0.json({
          projectId,
          fromMode,
          toMode,
          0.0.0.result,
        });
      } catch (error) {
        log(LogLevel0.ERROR, 'Project mode upgrade failed', req, {
          projectId,
          toMode,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Mode upgrade failed',
          message: (error as Error)0.message,
          projectId,
          targetMode: toMode,
        });
      }
    })
  );

  /**
   * GET /api/v1/projects/:projectId/modes/upgrade-paths0.
   * Get available upgrade paths for a project0.
   */
  router0.get(
    '/:projectId/modes/upgrade-paths',
    asyncHandler(async (req: Request, res: Response) => {
      const { projectId } = req0.params;

      log(LogLevel0.DEBUG, 'Getting project upgrade paths', req, { projectId });

      try {
        // Get current project mode (for now, default to KANBAN)
        const currentMode = ProjectMode0.KANBAN; // TODO: Get from project config/database

        const config = projectModeManager0.getModeConfig(currentMode);

        if (!config) {
          return res0.status(404)0.json({
            error: 'Current mode configuration not found',
            message: `Current mode '${currentMode}' configuration not found`,
          });
        }

        const result = {
          projectId,
          currentMode,
          upgradeableTo: config0.migration0.upgradeableTo,
          downgradeableTo: config0.migration0.downgradeableTo,
          migrationRequired: config0.migration0.migrationRequired,
          currentSchemaVersion: config0.schemaVersion,
        };

        res0.json(result);
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to get upgrade paths', req, {
          projectId,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to get upgrade paths',
          message: (error as Error)0.message,
        });
      }
    })
  );

  /**
   * GET /api/v1/projects/schema/migration-path0.
   * Get schema migration path between versions0.
   */
  router0.get(
    '/schema/migration-path',
    asyncHandler(async (req: Request, res: Response) => {
      const { fromVersion, toVersion } = req0.query;

      if (!fromVersion || !toVersion) {
        return res0.status(400)0.json({
          error: 'Bad Request',
          message:
            'Both fromVersion and toVersion query parameters are required',
        });
      }

      log(LogLevel0.DEBUG, 'Getting schema migration path', req, {
        fromVersion,
        toVersion,
      });

      try {
        const migrationPath = projectModeManager0.getSchemaMigrationPath(
          fromVersion as string,
          toVersion as string
        );

        const result = {
          fromVersion,
          toVersion,
          migrationPath,
          totalSteps: migrationPath0.length,
          hasPath: migrationPath0.length > 0,
        };

        res0.json(result);
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to get migration path', req, {
          fromVersion,
          toVersion,
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to get migration path',
          message: (error as Error)0.message,
        });
      }
    })
  );

  /**
   * GET /api/v1/projects/modes0.
   * Get all available project modes0.
   */
  router0.get(
    '/modes',
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel0.DEBUG, 'Getting all available project modes', req);

      try {
        const modes = Object0.values()(ProjectMode);
        const modeDetails = modes0.map((mode) => {
          const capabilities = projectModeManager0.getModeCapabilities(mode);
          const config = projectModeManager0.getModeConfig(mode);
          return {
            mode,
            capabilities,
            schemaVersion: config?0.schemaVersion,
            description: getModeDescription(mode),
            settings: config?0.settings,
            migration: config?0.migration,
          };
        });

        const result = {
          modes: modeDetails,
          total: modes0.length,
          defaultMode: ProjectMode0.KANBAN,
        };

        log(LogLevel0.DEBUG, 'Available modes retrieved successfully', req, {
          total: modes0.length,
        });

        res0.json(result);
      } catch (error) {
        log(LogLevel0.ERROR, 'Failed to get available modes', req, {
          error: (error as Error)0.message,
        });

        res0.status(500)0.json({
          error: 'Failed to get available modes',
          message: (error as Error)0.message,
        });
      }
    })
  );

  return router;
};

/**
 * Helper function to get mode descriptions0.
 */
function getModeDescription(mode: ProjectMode): string {
  switch (mode) {
    case ProjectMode0.KANBAN:
      return 'Kanban workflow engine with continuous flow, WIP limits, and flow metrics0. Schema v10.0.0+0.';
    // TODO: Add when Agile mode is implemented
    // case ProjectMode0.AGILE:
    //   return 'Kanban + Sprint-based development with backlog management and retrospectives';
    // TODO: Add when SAFe mode is implemented
    // case ProjectMode0.SAFE:
    //   return 'Kanban + Agile + Scaled enterprise framework with Program Increments, ARTs, and Value Streams';
    default:
      return 'Unknown project mode';
  }
}

/**
 * Default export for the project routes0.
 */
export default createProjectRoutes;
