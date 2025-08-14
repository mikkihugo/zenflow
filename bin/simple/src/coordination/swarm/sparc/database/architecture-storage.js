import { nanoid } from 'nanoid';
export class ArchitectureStorageService {
    db;
    tableName = 'sparc_architectures';
    componentsTableName = 'sparc_architecture_components';
    validationsTableName = 'sparc_architecture_validations';
    constructor(db) {
        this.db = db;
    }
    async initialize() {
        await this.db.execute(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        architecture_id TEXT UNIQUE NOT NULL,
        project_id TEXT,
        name TEXT NOT NULL,
        domain TEXT NOT NULL,
        design_data TEXT NOT NULL,
        components_data TEXT NOT NULL,
        validation_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        version INTEGER DEFAULT 1,
        tags TEXT,
        metadata TEXT
      )
    `);
        await this.db.execute(`
      CREATE TABLE IF NOT EXISTS ${this.componentsTableName} (
        id TEXT PRIMARY KEY,
        architecture_id TEXT NOT NULL,
        component_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        responsibilities TEXT NOT NULL,
        interfaces TEXT NOT NULL,
        dependencies TEXT NOT NULL,
        performance_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (architecture_id) REFERENCES ${this.tableName}(architecture_id)
      )
    `);
        await this.db.execute(`
      CREATE TABLE IF NOT EXISTS ${this.validationsTableName} (
        id TEXT PRIMARY KEY,
        architecture_id TEXT NOT NULL,
        validation_type TEXT NOT NULL,
        passed BOOLEAN NOT NULL,
        score REAL NOT NULL,
        results_data TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (architecture_id) REFERENCES ${this.tableName}(architecture_id)
      )
    `);
        await this.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_architectures_domain 
      ON ${this.tableName}(domain)
    `);
        await this.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_architectures_project 
      ON ${this.tableName}(project_id)
    `);
        await this.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_components_architecture 
      ON ${this.componentsTableName}(architecture_id)
    `);
        await this.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_validations_architecture 
      ON ${this.validationsTableName}(architecture_id)
    `);
    }
    async saveArchitecture(architecture, projectId) {
        const architectureId = architecture.id || nanoid();
        const timestamp = new Date();
        const record = {
            id: nanoid(),
            architecture_id: architectureId,
            project_id: projectId,
            name: this.generateArchitectureName(architecture),
            domain: this.extractDomain(architecture),
            design_data: JSON.stringify(architecture),
            components_data: JSON.stringify(architecture.components || []),
            validation_data: architecture.validationResults
                ? JSON.stringify(architecture.validationResults)
                : undefined,
            created_at: timestamp,
            updated_at: timestamp,
            tags: JSON.stringify(this.extractTags(architecture)),
            metadata: JSON.stringify(this.extractMetadata(architecture)),
        };
        const existing = await this.getArchitectureById(architectureId);
        if (existing) {
            await this.updateArchitecture(architectureId, architecture);
            return architectureId;
        }
        await this.db.execute(`
      INSERT INTO ${this.tableName} (
        id, architecture_id, project_id, name, domain, design_data, 
        components_data, validation_data, created_at, updated_at, 
        tags, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            record.id,
            record.architecture_id,
            record.project_id,
            record.name,
            record.domain,
            record.design_data,
            record.components_data,
            record.validation_data,
            record.created_at,
            record.updated_at,
            record.tags,
            record.metadata,
        ]);
        await this.saveComponents(architectureId, architecture.components || []);
        return architectureId;
    }
    async getArchitectureById(architectureId) {
        const result = await this.db.query(`
      SELECT * FROM ${this.tableName} 
      WHERE architecture_id = ?
    `, [architectureId]);
        if (!result?.rows || result?.rows.length === 0) {
            return null;
        }
        const record = result?.rows?.[0];
        return this.recordToArchitecture(record);
    }
    async getArchitecturesByProject(projectId) {
        const result = await this.db.query(`
      SELECT * FROM ${this.tableName} 
      WHERE project_id = ?
      ORDER BY updated_at DESC
    `, [projectId]);
        if (!result?.rows || result?.rows.length === 0) {
            return [];
        }
        return result?.rows?.map((record) => this.recordToArchitecture(record));
    }
    async getArchitecturesByDomain(domain) {
        const result = await this.db.query(`
      SELECT * FROM ${this.tableName} 
      WHERE domain = ?
      ORDER BY updated_at DESC
    `, [domain]);
        if (!result?.rows || result?.rows.length === 0) {
            return [];
        }
        return result?.rows?.map((record) => this.recordToArchitecture(record));
    }
    async updateArchitecture(architectureId, architecture) {
        const timestamp = new Date();
        await this.db.execute(`
      UPDATE ${this.tableName} SET
        design_data = ?,
        components_data = ?,
        validation_data = ?,
        updated_at = ?,
        version = version + 1,
        tags = ?,
        metadata = ?
      WHERE architecture_id = ?
    `, [
            JSON.stringify(architecture),
            JSON.stringify(architecture.components || []),
            architecture.validationResults
                ? JSON.stringify(architecture.validationResults)
                : null,
            timestamp,
            JSON.stringify(this.extractTags(architecture)),
            JSON.stringify(this.extractMetadata(architecture)),
            architectureId,
        ]);
        await this.updateComponents(architectureId, architecture.components || []);
    }
    async deleteArchitecture(architectureId) {
        await this.db.execute(`
      DELETE FROM ${this.validationsTableName} 
      WHERE architecture_id = ?
    `, [architectureId]);
        await this.db.execute(`
      DELETE FROM ${this.componentsTableName} 
      WHERE architecture_id = ?
    `, [architectureId]);
        await this.db.execute(`
      DELETE FROM ${this.tableName} 
      WHERE architecture_id = ?
    `, [architectureId]);
    }
    async saveValidation(architectureId, validation, validationType = 'general') {
        const record = {
            id: nanoid(),
            architecture_id: architectureId,
            validation_type: validationType,
            passed: validation.approved,
            score: validation.overallScore || 0,
            results_data: JSON.stringify(validation.validationResults || []),
            recommendations: JSON.stringify(validation.recommendations || []),
            created_at: new Date(),
        };
        await this.db.execute(`
      INSERT INTO ${this.validationsTableName} (
        id, architecture_id, validation_type, passed, score,
        results_data, recommendations, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            record.id,
            record.architecture_id,
            record.validation_type,
            record.passed,
            record.score,
            record.results_data,
            record.recommendations,
            record.created_at,
        ]);
    }
    async getValidationHistory(architectureId) {
        const result = await this.db.query(`
      SELECT * FROM ${this.validationsTableName} 
      WHERE architecture_id = ?
      ORDER BY created_at DESC
    `, [architectureId]);
        if (!result?.rows || result?.rows.length === 0) {
            return [];
        }
        return result?.rows?.map((record) => ({
            overallScore: record.score,
            validationResults: JSON.parse(record.results_data),
            recommendations: JSON.parse(record.recommendations),
            approved: record.passed,
        }));
    }
    async searchArchitectures(criteria) {
        let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
        const params = [];
        if (criteria.domain) {
            query += ' AND domain = ?';
            params.push(criteria.domain);
        }
        if (criteria.tags && criteria.tags.length > 0) {
            for (const tag of criteria.tags) {
                query += ' AND tags LIKE ?';
                params.push(`%"${tag}"%`);
            }
        }
        query += ' ORDER BY updated_at DESC';
        if (criteria.limit) {
            query += ' LIMIT ?';
            params.push(criteria.limit);
        }
        const result = await this.db.query(query, params);
        if (!result?.rows || result?.rows.length === 0) {
            return [];
        }
        let architectures = result?.rows?.map((record) => this.recordToArchitecture(record));
        if (criteria.minScore !== undefined) {
            architectures = architectures.filter((arch) => {
                const validation = arch.validationResults;
                return validation && validation.overallScore >= criteria.minScore;
            });
        }
        return architectures;
    }
    async getArchitectureStats() {
        const totalResult = await this.db.query(`
      SELECT COUNT(*) as count FROM ${this.tableName}
    `);
        const totalArchitectures = totalResult?.rows?.[0]?.count;
        const domainResult = await this.db.query(`
      SELECT domain, COUNT(*) as count 
      FROM ${this.tableName} 
      GROUP BY domain
    `);
        const byDomain = {};
        domainResult?.rows?.forEach((row) => {
            byDomain[row.domain] = row.count;
        });
        const componentsResult = await this.db.query(`
      SELECT AVG(component_count) as avg_components
      FROM (
        SELECT COUNT(*) as component_count 
        FROM ${this.componentsTableName} 
        GROUP BY architecture_id
      ) AS component_counts
    `);
        const averageComponents = componentsResult?.rows?.[0]?.avg_components || 0;
        const validationResult = await this.db.query(`
      SELECT 
        COUNT(*) as total_validated,
        AVG(score) as average_score,
        AVG(CASE WHEN passed THEN 1.0 ELSE 0.0 END) as pass_rate
      FROM ${this.validationsTableName}
    `);
        const validationStats = {
            totalValidated: validationResult?.rows?.[0]?.total_validated || 0,
            averageScore: validationResult?.rows?.[0]?.average_score || 0,
            passRate: validationResult?.rows?.[0]?.pass_rate || 0,
        };
        return {
            totalArchitectures,
            byDomain,
            averageComponents,
            validationStats,
        };
    }
    async saveComponents(architectureId, components) {
        await this.db.execute(`
      DELETE FROM ${this.componentsTableName} 
      WHERE architecture_id = ?
    `, [architectureId]);
        for (const component of components) {
            const record = {
                id: nanoid(),
                architecture_id: architectureId,
                component_id: component.id || nanoid(),
                name: component.name,
                type: component.type,
                responsibilities: JSON.stringify(component.responsibilities),
                interfaces: JSON.stringify(component.interfaces),
                dependencies: JSON.stringify(component.dependencies),
                performance_data: JSON.stringify(component.performance),
                created_at: new Date(),
                updated_at: new Date(),
            };
            await this.db.execute(`
        INSERT INTO ${this.componentsTableName} (
          id, architecture_id, component_id, name, type,
          responsibilities, interfaces, dependencies, performance_data,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                record.id,
                record.architecture_id,
                record.component_id,
                record.name,
                record.type,
                record.responsibilities,
                record.interfaces,
                record.dependencies,
                record.performance_data,
                record.created_at,
                record.updated_at,
            ]);
        }
    }
    async updateComponents(architectureId, components) {
        await this.saveComponents(architectureId, components);
    }
    recordToArchitecture(record) {
        const designData = JSON.parse(record.design_data);
        const components = JSON.parse(record.components_data);
        const validationData = record.validation_data
            ? JSON.parse(record.validation_data)
            : undefined;
        return {
            ...designData,
            id: record.architecture_id,
            components,
            validationResults: validationData,
            createdAt: record.created_at,
            updatedAt: record.updated_at,
        };
    }
    generateArchitectureName(architecture) {
        const domain = this.extractDomain(architecture);
        const componentCount = architecture.components?.length || 0;
        const timestamp = new Date().toISOString().slice(0, 10);
        return `${domain}-architecture-${componentCount}comp-${timestamp}`;
    }
    extractDomain(architecture) {
        return (architecture.systemArchitecture?.technologyStack?.[0]?.category ||
            'general');
    }
    extractTags(architecture) {
        const tags = [];
        architecture.components.forEach((component) => {
            if (component.type && !tags.includes(component.type)) {
                tags.push(component.type);
            }
        });
        architecture.systemArchitecture?.architecturalPatterns?.forEach((pattern) => {
            if (pattern.name && !tags.includes(pattern.name)) {
                tags.push(pattern.name);
            }
        });
        return tags;
    }
    extractMetadata(architecture) {
        return {
            componentCount: architecture.components?.length || 0,
            qualityAttributeCount: architecture.qualityAttributes?.length || 0,
            securityRequirementCount: architecture.securityRequirements?.length || 0,
            scalabilityRequirementCount: architecture.scalabilityRequirements?.length || 0,
            hasValidation: !!architecture.validationResults,
        };
    }
}
//# sourceMappingURL=architecture-storage.js.map