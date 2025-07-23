/**
 * Service Discovery Plugin
 * Service registry management, health checks, and discovery for microservices
 */

import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';

export class ServiceDiscoveryPlugin {
  constructor(config = {}) {
    this.config = {
      servicesDir: 'services',
      registryFile: path.join(process.cwd(), '.hive-mind', 'service-registry.json'),
      healthCheckTimeout: 5000,
      discoveryInterval: 30000,
      portRange: { min: 3000, max: 9999 },
      protocols: ['http', 'https', 'grpc', 'tcp'],
      autoRegister: true,
      healthEndpoint: '/health',
      ...config
    };
    
    this.registry = new Map();
    this.activeServices = new Map();
    this.healthCheckInterval = null;
    this.stats = {
      servicesFound: 0,
      servicesRegistered: 0,
      healthyServices: 0,
      unhealthyServices: 0
    };
  }

  async initialize() {
    console.log('🔍 Service Discovery Plugin initialized');
    
    // Load existing registry
    await this.loadRegistry();
    
    // Discover services
    await this.discoverServices();
    
    // Start health monitoring
    if (this.config.discoveryInterval > 0) {
      this.startHealthMonitoring();
    }
  }

  async loadRegistry() {
    try {
      const content = await readFile(this.config.registryFile, 'utf8');
      const registryData = JSON.parse(content);
      
      // Convert to Map
      for (const [serviceId, serviceInfo] of Object.entries(registryData.services || {})) {
        this.registry.set(serviceId, {
          ...serviceInfo,
          lastSeen: new Date(serviceInfo.lastSeen || Date.now()),
          registered: new Date(serviceInfo.registered || Date.now())
        });
      }
      
      console.log(`📋 Loaded ${this.registry.size} services from registry`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📋 No existing registry found, creating new one');
        await this.saveRegistry();
      } else {
        console.warn('⚠️ Failed to load registry:', error.message);
      }
    }
  }

  async saveRegistry() {
    const registryData = {
      version: '1.0',
      updated: new Date().toISOString(),
      services: {}
    };
    
    // Convert Map to object
    for (const [serviceId, serviceInfo] of this.registry) {
      registryData.services[serviceId] = {
        ...serviceInfo,
        lastSeen: serviceInfo.lastSeen.toISOString(),
        registered: serviceInfo.registered.toISOString()
      };
    }
    
    // Ensure directory exists
    await mkdir(path.dirname(this.config.registryFile), { recursive: true });
    await writeFile(this.config.registryFile, JSON.stringify(registryData, null, 2));
  }

  async discoverServices() {
    console.log(`🔍 Discovering services in ${this.config.servicesDir}/`);
    
    const results = {
      discovered: [],
      registered: [],
      unmapped: [],
      unhealthy: []
    };
    
    try {
      // Find service directories
      const serviceDirs = await this.findServiceDirectories();
      this.stats.servicesFound = serviceDirs.length;
      
      for (const serviceDir of serviceDirs) {
        const serviceInfo = await this.analyzeService(serviceDir);
        
        if (serviceInfo) {
          results.discovered.push(serviceInfo);
          
          // Check if service is registered
          const serviceId = serviceInfo.id;
          if (this.registry.has(serviceId)) {
            // Update existing registration
            const existing = this.registry.get(serviceId);
            this.registry.set(serviceId, {
              ...existing,
              ...serviceInfo,
              lastSeen: new Date(),
              status: 'discovered'
            });
            results.registered.push(serviceInfo);
          } else if (this.config.autoRegister) {
            // Auto-register new service
            await this.registerService(serviceInfo);
            results.registered.push(serviceInfo);
          } else {
            results.unmapped.push(serviceInfo);
          }
        }
      }
      
      // Check health of registered services
      await this.performHealthChecks(results);
      
      // Update stats
      this.stats.servicesRegistered = this.registry.size;
      this.stats.healthyServices = results.registered.filter(s => s.healthy).length;
      this.stats.unhealthyServices = results.registered.filter(s => !s.healthy).length;
      
      console.log(`✅ Discovery complete: ${results.discovered.length} found, ${results.registered.length} registered`);
      
      // Save updated registry
      await this.saveRegistry();
      
      return results;
    } catch (error) {
      console.error('❌ Service discovery failed:', error.message);
      throw error;
    }
  }

  async findServiceDirectories() {
    const { glob } = await import('glob');
    
    // Look for service directories
    const patterns = [
      `${this.config.servicesDir}/*`,
      'apps/*',
      'packages/*/service*',
      'microservices/*'
    ];
    
    const directories = [];
    for (const pattern of patterns) {
      try {
        const matches = await glob(pattern, { 
          onlyDirectories: true,
          ignore: ['**/node_modules/**', '**/.git/**']
        });
        directories.push(...matches);
      } catch (error) {
        // Pattern might not match, continue
      }
    }
    
    return [...new Set(directories)]; // Remove duplicates
  }

  async analyzeService(serviceDir) {
    const serviceName = path.basename(serviceDir);
    const serviceId = serviceName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    const service = {
      id: serviceId,
      name: serviceName,
      path: serviceDir,
      type: 'unknown',
      protocol: 'http',
      port: null,
      endpoints: [],
      dependencies: [],
      metadata: {},
      healthy: false,
      lastHealthCheck: null,
      discovered: new Date()
    };
    
    try {
      // Check for package.json (Node.js service)
      const packageJsonPath = path.join(serviceDir, 'package.json');
      try {
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
        service.type = 'nodejs';
        service.metadata.packageJson = packageJson;
        service.metadata.version = packageJson.version;
        service.metadata.description = packageJson.description;
        
        // Extract port from scripts or config
        service.port = this.extractPortFromPackageJson(packageJson);
        
        // Extract dependencies
        service.dependencies = this.extractServiceDependencies(packageJson);
        
      } catch {
        // Not a Node.js service, continue analysis
      }
      
      // Check for Python service (requirements.txt, main.py, etc.)
      if (service.type === 'unknown') {
        service.type = await this.detectPythonService(serviceDir);
      }
      
      // Check for Go service (go.mod, main.go)
      if (service.type === 'unknown') {
        service.type = await this.detectGoService(serviceDir);
      }
      
      // Check for Docker service
      const dockerfilePath = path.join(serviceDir, 'Dockerfile');
      try {
        await access(dockerfilePath);
        const dockerfile = await readFile(dockerfilePath, 'utf8');
        service.metadata.docker = true;
        service.port = service.port || this.extractPortFromDockerfile(dockerfile);
      } catch {
        // No Dockerfile
      }
      
      // Check for docker-compose.yml
      const composePath = path.join(serviceDir, 'docker-compose.yml');
      try {
        const composeContent = await readFile(composePath, 'utf8');
        service.metadata.compose = true;
        const composeInfo = this.parseDockerCompose(composeContent);
        service.port = service.port || composeInfo.port;
        service.dependencies.push(...composeInfo.dependencies);
      } catch {
        // No docker-compose.yml
      }
      
      // Auto-detect port if not found
      if (!service.port) {
        service.port = await this.detectRunningPort(serviceName);
      }
      
      // Generate default endpoints
      if (service.port && service.protocol === 'http') {
        service.endpoints = this.generateDefaultEndpoints(service.port);
      }
      
      return service;
    } catch (error) {
      console.warn(`⚠️ Failed to analyze service ${serviceName}: ${error.message}`);
      return null;
    }
  }

  async detectPythonService(serviceDir) {
    const pythonFiles = ['requirements.txt', 'setup.py', 'pyproject.toml', 'main.py', 'app.py'];
    
    for (const file of pythonFiles) {
      try {
        await access(path.join(serviceDir, file));
        return 'python';
      } catch {
        continue;
      }
    }
    
    return 'unknown';
  }

  async detectGoService(serviceDir) {
    const goFiles = ['go.mod', 'main.go'];
    
    for (const file of goFiles) {
      try {
        await access(path.join(serviceDir, file));
        return 'go';
      } catch {
        continue;
      }
    }
    
    return 'unknown';
  }

  extractPortFromPackageJson(packageJson) {
    // Check scripts for port references
    if (packageJson.scripts) {
      for (const script of Object.values(packageJson.scripts)) {
        const portMatch = script.match(/PORT[=\s]+(\d+)|--port[=\s]+(\d+)|-p[=\s]+(\d+)/i);
        if (portMatch) {
          return parseInt(portMatch[1] || portMatch[2] || portMatch[3]);
        }
      }
    }
    
    // Check config section
    if (packageJson.config && packageJson.config.port) {
      return parseInt(packageJson.config.port);
    }
    
    return null;
  }

  extractPortFromDockerfile(dockerfile) {
    const exposeMatch = dockerfile.match(/EXPOSE\s+(\d+)/i);
    return exposeMatch ? parseInt(exposeMatch[1]) : null;
  }

  parseDockerCompose(composeContent) {
    const info = {
      port: null,
      dependencies: []
    };
    
    try {
      const yaml = require('js-yaml');
      const compose = yaml.load(composeContent);
      
      if (compose.services) {
        for (const [serviceName, service] of Object.entries(compose.services)) {
          // Extract port
          if (service.ports) {
            const port = service.ports[0];
            if (typeof port === 'string') {
              const portMatch = port.match(/(\d+):/);
              if (portMatch) {
                info.port = parseInt(portMatch[1]);
              }
            }
          }
          
          // Extract dependencies
          if (service.depends_on) {
            info.dependencies.push(...service.depends_on);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse docker-compose.yml:', error.message);
    }
    
    return info;
  }

  extractServiceDependencies(packageJson) {
    const dependencies = [];
    
    // Look for service-related dependencies
    const serviceDeps = Object.keys(packageJson.dependencies || {})
      .filter(dep => dep.includes('service') || dep.includes('client') || dep.includes('api'));
    
    dependencies.push(...serviceDeps);
    
    return dependencies;
  }

  async detectRunningPort(serviceName) {
    try {
      // Try to find running process with service name
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync(`netstat -tlnp 2>/dev/null | grep :${this.config.portRange.min}-${this.config.portRange.max} || true`);
      
      // Parse netstat output to find potential service ports
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes(serviceName) || line.includes('node')) {
          const portMatch = line.match(/:(\d+)\s/);
          if (portMatch) {
            const port = parseInt(portMatch[1]);
            if (port >= this.config.portRange.min && port <= this.config.portRange.max) {
              return port;
            }
          }
        }
      }
    } catch (error) {
      // Process detection failed, that's OK
    }
    
    return null;
  }

  generateDefaultEndpoints(port) {
    const baseUrl = `http://localhost:${port}`;
    
    return [
      { path: '/health', method: 'GET', purpose: 'health_check' },
      { path: '/status', method: 'GET', purpose: 'status' },
      { path: '/metrics', method: 'GET', purpose: 'metrics' },
      { path: '/info', method: 'GET', purpose: 'info' },
      { path: '/api', method: 'GET', purpose: 'api_root' }
    ].map(endpoint => ({
      ...endpoint,
      url: `${baseUrl}${endpoint.path}`
    }));
  }

  async registerService(serviceInfo) {
    console.log(`📝 Registering service: ${serviceInfo.name}`);
    
    const registration = {
      ...serviceInfo,
      registered: new Date(),
      lastSeen: new Date(),
      status: 'registered'
    };
    
    this.registry.set(serviceInfo.id, registration);
    return registration;
  }

  async performHealthChecks(results) {
    console.log('🏥 Performing health checks...');
    
    const healthPromises = results.registered.map(async (service) => {
      try {
        const isHealthy = await this.checkServiceHealth(service);
        service.healthy = isHealthy;
        service.lastHealthCheck = new Date();
        
        // Update registry
        const registered = this.registry.get(service.id);
        if (registered) {
          registered.healthy = isHealthy;
          registered.lastHealthCheck = new Date();
          registered.status = isHealthy ? 'healthy' : 'unhealthy';
        }
      } catch (error) {
        service.healthy = false;
        service.lastHealthCheck = new Date();
        service.healthError = error.message;
      }
    });
    
    await Promise.all(healthPromises);
  }

  async checkServiceHealth(service) {
    if (!service.port) {
      return false; // Can't check health without port
    }
    
    try {
      const healthUrl = `http://localhost:${service.port}${this.config.healthEndpoint}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.healthCheckTimeout);
      
      const response = await fetch(healthUrl, {
        signal: controller.signal,
        method: 'GET'
      });
      
      clearTimeout(timeoutId);
      
      return response.ok; // 200-299 status codes
    } catch (error) {
      // Service is not responding or not healthy
      return false;
    }
  }

  startHealthMonitoring() {
    console.log(`🔄 Starting health monitoring (${this.config.discoveryInterval}ms intervals)`);
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        const services = Array.from(this.registry.values());
        const healthPromises = services.map(async (service) => {
          const isHealthy = await this.checkServiceHealth(service);
          service.healthy = isHealthy;
          service.lastHealthCheck = new Date();
          service.status = isHealthy ? 'healthy' : 'unhealthy';
        });
        
        await Promise.all(healthPromises);
        await this.saveRegistry();
        
        // Update stats
        this.stats.healthyServices = services.filter(s => s.healthy).length;
        this.stats.unhealthyServices = services.filter(s => !s.healthy).length;
        
      } catch (error) {
        console.warn('⚠️ Health monitoring failed:', error.message);
      }
    }, this.config.discoveryInterval);
  }

  // API Methods
  async scan(rootPath, options = {}) {
    console.log(`🔍 Scanning for services in ${rootPath}`);
    
    const results = await this.discoverServices();
    
    // Convert to suggestion format for integration with hive-mind
    const suggestions = [];
    
    // Unmapped services
    for (const service of results.unmapped) {
      suggestions.push({
        id: `unmapped-service-${service.id}`,
        description: `Found unmapped service: ${service.name} at ${service.path}`,
        action: 'register_service',
        service: service,
        severity: 'medium'
      });
    }
    
    // Unhealthy services
    for (const service of results.registered.filter(s => !s.healthy)) {
      suggestions.push({
        id: `unhealthy-service-${service.id}`,
        description: `Service ${service.name} is unhealthy or not responding`,
        action: 'investigate_health',
        service: service,
        severity: 'high'
      });
    }
    
    // Services without health endpoints
    for (const service of results.registered.filter(s => !s.endpoints.some(e => e.purpose === 'health_check'))) {
      suggestions.push({
        id: `no-health-endpoint-${service.id}`,
        description: `Service ${service.name} lacks health check endpoint`,
        action: 'add_health_endpoint',
        service: service,
        severity: 'low'
      });
    }
    
    return {
      summary: {
        servicesFound: results.discovered.length,
        servicesRegistered: results.registered.length,
        unmappedServices: results.unmapped.length,
        healthyServices: results.registered.filter(s => s.healthy).length,
        unhealthyServices: results.registered.filter(s => !s.healthy).length
      },
      services: results.discovered,
      registry: Array.from(this.registry.values()),
      suggestions: suggestions
    };
  }

  getServiceById(serviceId) {
    return this.registry.get(serviceId);
  }

  getAllServices() {
    return Array.from(this.registry.values());
  }

  getHealthyServices() {
    return Array.from(this.registry.values()).filter(s => s.healthy);
  }

  getUnhealthyServices() {
    return Array.from(this.registry.values()).filter(s => !s.healthy);
  }

  async unregisterService(serviceId) {
    const removed = this.registry.delete(serviceId);
    if (removed) {
      await this.saveRegistry();
      console.log(`📝 Unregistered service: ${serviceId}`);
    }
    return removed;
  }

  async getStats() {
    return {
      ...this.stats,
      totalRegistered: this.registry.size,
      monitoringActive: !!this.healthCheckInterval,
      discoveryInterval: this.config.discoveryInterval,
      lastDiscovery: new Date().toISOString()
    };
  }

  async cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    this.registry.clear();
    this.activeServices.clear();
    
    console.log('🔍 Service Discovery Plugin cleaned up');
  }
}

export default ServiceDiscoveryPlugin;