# 📋 Task Summary

**Generated:** {{timestamp}}

{{#each tasks}}
## {{name}}

- **Status:** {{status}}
- **Duration:** {{duration}}
- **Description:** {{description}}
{{#if error}}
- **Error:** {{error}}
{{/if}}

{{/each}}