# 🏥 System Health Report

**Generated:** {{timestamp}}  
**Overall Status:** {{system.status}}

## Services

{{#each services}}
### {{name}} - {{status}}

- **Uptime:** {{uptime}}
- **Memory:** {{memory}}
{{#if issues}}
- **Issues:** {{issues}}
{{/if}}

{{/each}}