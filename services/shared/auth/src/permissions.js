/**
 * Permission Management for Vision-to-Code Services
 * Defines and validates service and user permissions
 */

// Permission definitions
const PERMISSIONS = {
  // Vision permissions
  VISION_CREATE: 'vision:create',
  VISION_READ: 'vision:read',
  VISION_UPDATE: 'vision:update',
  VISION_DELETE: 'vision:delete',
  VISION_APPROVE: 'vision:approve',
  
  // Workflow permissions
  WORKFLOW_REGISTER: 'workflow:register',
  WORKFLOW_READ: 'workflow:read',
  WORKFLOW_UPDATE: 'workflow:update',
  WORKFLOW_EXECUTE: 'workflow:execute',
  
  // Agent permissions
  AGENT_SPAWN: 'agent:spawn',
  AGENT_CONTROL: 'agent:control',
  AGENT_MONITOR: 'agent:monitor',
  AGENT_TERMINATE: 'agent:terminate',
  
  // Squad permissions
  SQUAD_CREATE: 'squad:create',
  SQUAD_ASSIGN: 'squad:assign',
  SQUAD_MONITOR: 'squad:monitor',
  
  // System permissions
  SYSTEM_HEALTH: 'system:health',
  SYSTEM_METRICS: 'system:metrics',
  SYSTEM_ADMIN: 'system:admin',
  
  // Event permissions
  EVENT_PUBLISH: 'event:publish',
  EVENT_SUBSCRIBE: 'event:subscribe',
  EVENT_REPLAY: 'event:replay'
};

// Role definitions with associated permissions
const ROLES = {
  // Service roles
  SERVICE_BUSINESS: {
    name: 'service:business',
    permissions: [
      PERMISSIONS.VISION_CREATE,
      PERMISSIONS.VISION_READ,
      PERMISSIONS.VISION_UPDATE,
      PERMISSIONS.VISION_DELETE,
      PERMISSIONS.VISION_APPROVE,
      PERMISSIONS.WORKFLOW_REGISTER,
      PERMISSIONS.EVENT_PUBLISH,
      PERMISSIONS.SYSTEM_HEALTH
    ]
  },
  
  SERVICE_CORE: {
    name: 'service:core',
    permissions: [
      PERMISSIONS.WORKFLOW_REGISTER,
      PERMISSIONS.WORKFLOW_READ,
      PERMISSIONS.WORKFLOW_UPDATE,
      PERMISSIONS.SYSTEM_HEALTH,
      PERMISSIONS.SYSTEM_METRICS,
      PERMISSIONS.EVENT_PUBLISH,
      PERMISSIONS.EVENT_SUBSCRIBE
    ]
  },
  
  SERVICE_SWARM: {
    name: 'service:swarm',
    permissions: [
      PERMISSIONS.AGENT_SPAWN,
      PERMISSIONS.AGENT_CONTROL,
      PERMISSIONS.AGENT_MONITOR,
      PERMISSIONS.AGENT_TERMINATE,
      PERMISSIONS.WORKFLOW_READ,
      PERMISSIONS.EVENT_PUBLISH,
      PERMISSIONS.EVENT_SUBSCRIBE,
      PERMISSIONS.SYSTEM_HEALTH
    ]
  },
  
  SERVICE_DEVELOPMENT: {
    name: 'service:development',
    permissions: [
      PERMISSIONS.SQUAD_CREATE,
      PERMISSIONS.SQUAD_ASSIGN,
      PERMISSIONS.SQUAD_MONITOR,
      PERMISSIONS.WORKFLOW_EXECUTE,
      PERMISSIONS.EVENT_PUBLISH,
      PERMISSIONS.EVENT_SUBSCRIBE,
      PERMISSIONS.SYSTEM_HEALTH
    ]
  },
  
  // User roles
  USER_ADMIN: {
    name: 'user:admin',
    permissions: Object.values(PERMISSIONS)
  },
  
  USER_MANAGER: {
    name: 'user:manager',
    permissions: [
      PERMISSIONS.VISION_CREATE,
      PERMISSIONS.VISION_READ,
      PERMISSIONS.VISION_UPDATE,
      PERMISSIONS.VISION_APPROVE,
      PERMISSIONS.WORKFLOW_READ,
      PERMISSIONS.SQUAD_MONITOR,
      PERMISSIONS.SYSTEM_HEALTH,
      PERMISSIONS.SYSTEM_METRICS
    ]
  },
  
  USER_DEVELOPER: {
    name: 'user:developer',
    permissions: [
      PERMISSIONS.VISION_READ,
      PERMISSIONS.WORKFLOW_READ,
      PERMISSIONS.SQUAD_MONITOR,
      PERMISSIONS.SYSTEM_HEALTH
    ]
  },
  
  USER_VIEWER: {
    name: 'user:viewer',
    permissions: [
      PERMISSIONS.VISION_READ,
      PERMISSIONS.SYSTEM_HEALTH
    ]
  }
};

// Service to role mapping
const SERVICE_ROLE_MAP = {
  'business-service': ROLES.SERVICE_BUSINESS,
  'core-service': ROLES.SERVICE_CORE,
  'swarm-service': ROLES.SERVICE_SWARM,
  'development-service': ROLES.SERVICE_DEVELOPMENT
};

class PermissionManager {
  constructor() {
    this.permissions = PERMISSIONS;
    this.roles = ROLES;
  }

  /**
   * Get permissions for a service
   */
  getServicePermissions(serviceId) {
    const role = SERVICE_ROLE_MAP[serviceId];
    return role ? role.permissions : [];
  }

  /**
   * Get permissions for a user based on roles
   */
  getUserPermissions(userRoles = []) {
    const permissions = new Set();
    
    userRoles.forEach(roleName => {
      const role = Object.values(ROLES).find(r => r.name === roleName);
      if (role) {
        role.permissions.forEach(perm => permissions.add(perm));
      }
    });
    
    return Array.from(permissions);
  }

  /**
   * Check if a subject has a specific permission
   */
  hasPermission(subject, permission) {
    const permissions = subject.permissions || [];
    return permissions.includes(permission);
  }

  /**
   * Check if a subject has any of the required permissions
   */
  hasAnyPermission(subject, requiredPermissions = []) {
    const permissions = subject.permissions || [];
    return requiredPermissions.some(perm => permissions.includes(perm));
  }

  /**
   * Check if a subject has all required permissions
   */
  hasAllPermissions(subject, requiredPermissions = []) {
    const permissions = subject.permissions || [];
    return requiredPermissions.every(perm => permissions.includes(perm));
  }

  /**
   * Express middleware for permission checking
   */
  requirePermissions(...requiredPermissions) {
    return (req, res, next) => {
      if (!req.auth) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required'
          }
        });
      }

      const hasPermission = this.hasAllPermissions(req.auth, requiredPermissions);

      if (!hasPermission) {
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `Required permissions: ${requiredPermissions.join(', ')}`,
            details: {
              required: requiredPermissions,
              current: req.auth.permissions || []
            }
          }
        });
      }

      next();
    };
  }

  /**
   * Express middleware for role checking
   */
  requireRole(roleName) {
    return (req, res, next) => {
      if (!req.auth) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required'
          }
        });
      }

      const roles = req.auth.roles || [];
      if (!roles.includes(roleName)) {
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_ROLE',
            message: `Required role: ${roleName}`,
            details: {
              required: roleName,
              current: roles
            }
          }
        });
      }

      next();
    };
  }

  /**
   * Get all available permissions
   */
  getAllPermissions() {
    return { ...this.permissions };
  }

  /**
   * Get all available roles
   */
  getAllRoles() {
    return { ...this.roles };
  }

  /**
   * Validate permission string
   */
  isValidPermission(permission) {
    return Object.values(PERMISSIONS).includes(permission);
  }

  /**
   * Validate role
   */
  isValidRole(roleName) {
    return Object.values(ROLES).some(role => role.name === roleName);
  }
}

// Singleton instance
let instance;

function getPermissionManager() {
  if (!instance) {
    instance = new PermissionManager();
  }
  return instance;
}

module.exports = {
  PERMISSIONS,
  ROLES,
  SERVICE_ROLE_MAP,
  PermissionManager,
  getPermissionManager
};