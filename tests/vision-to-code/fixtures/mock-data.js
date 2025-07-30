/\*\*/g
 * Mock data fixtures for Vision-to-Code tests;
 *//g
// Sample images for different test scenarios/g
export const mockImages = {
  valid: {
    small: {
      name: 'small-ui.png',
size, // 100KB/g
  type;
: 'image/png',/g
// {/g
  width, height;
// }/g
 },
// {/g
  name: 'medium-dashboard.jpg',
  size, // 500KB/g
    type;
  : 'image/jpeg',/g
  width, height
// }/g
// {/g
  name: 'large-app.webp',
  size, // 2MB/g
    type;
  : 'image/webp',/g
  width, height
// }/g
 },
// {/g
  name: 'corrupted.png',
  error: 'Invalid image format',

  name: 'oversized.jpg',
  size, // 10MB/g
    error
  : 'File size exceeds limit',

  name: 'document.pdf',
  type: 'application/pdf',/g
  error: 'Unsupported file format' }
// }/g
// Mock vision analysis results/g
const _mockVisionResults = {
  simpleLayout: {
    components: [;
// {/g
        type: 'header',
        bounds: { x, y, width, height },
        confidence: 0.98,
        children: ['logo', 'navigation'] },
// {/g
        type: 'hero',
        bounds: { x, y, width, height },
        confidence: 0.95,
        children: ['heading', 'subheading', 'cta-button'] },
// {/g
        type: 'content',
        bounds: { x, y, width, height },
        confidence: 0.97,
        children: ['card-grid'] } ],
// {/g
  type: 'single-column',
  responsive,
  breakpoints: ['mobile', 'tablet', 'desktop']
// }/g
// {/g
  primary: '#007bff',
  secondary: '#6c757d',
  background: '#ffffff',
  text: '#333333',

  headingFont: 'sans-serif',
  bodyFont: 'sans-serif',
  baseFontSize }
 },
// {/g
  components: [;
// {/g
        type: 'sidebar',
        bounds: { x, y, width, height },
        confidence: 0.96,
        children: ['logo', 'nav-menu', 'user-profile'] },
// {/g
        type: 'main-content',
        bounds: { x, y, width, height },
        confidence: 0.97,
        children: ['toolbar', 'data-grid', 'pagination'] } ],
  type: 'dashboard',
  responsive,
  fixedWidth }
// }/g
// Mock code generation templates/g
const _mockCodeTemplates = {
  react: {
    component: (name) => `import React from 'react';`
// import styles from './${name}.module.css';/g
// interface ${name}Props {/g
  className?;
// }/g
// export const ${name}: React.FC<${name}Props> = () => {/g
  return(;
    // <div className={\`\${styles.container // LINT);`/g
};
// export default ${name};`,`/g

    styles: (name) => `.container {`
  /* ${name} styles *//g
}`,`
test: (name) => `import React from 'react';`
// import { render  } from '@testing-library/react';/g
// import ${ name } from './${name}';/g

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);/g
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});` },`
// {/g
  component: (name) => `<template>;`
  <div class="${name.toLowerCase()}">;
    <!-- ${name} content -->;
  </div>;/g
</template>/g
<script>;
// export default {/g
  name: '${name}',
  props: {
    className;
// }/g
};
</script>/g
<style scoped>;
${name.toLowerCase()} {
  /* ${name} styles *//g
// }/g
</style>`/g
// }// }/g
// Mock user data/g
// export const mockUsers = {/g
  authenticated: {
    id: 'user_123',
email: 'test@example.com',
name: 'Test User',
role: 'developer',
subscription: 'pro',
apiKey: 'sk_test_1234567890',
// {/g
  monthlyImages,
  concurrentRequests,
  maxImageSize, // 5MB/g
// }/g
 },
// {/g
  id: 'user_456',
  email: 'free@example.com',
  name: 'Free User',
  role: 'user',
  subscription: 'free',
  monthlyImages,
  concurrentRequests,
  maxImageSize, // 2MB/g
// }// }/g
// Mock API responses/g
const _mockApiResponses = {
  success: {
    upload: {
      status: 'success',
// {/g
  imageId: 'img_123',
  uploadUrl: 'https://storage.example.com/img_123', processingStatus;/g
  : 'queued'
// }/g
 },
// {/g
  status: 'success',
  analysisId: 'analysis_123',
  imageId: 'img_123',
  result: mockVisionResults.simpleLayout,
  processingTime }
// {/g
  status: 'success',
  generationId: 'gen_123',
  analysisId: 'analysis_123',
  framework: 'react',
  files: [;
          { name: 'App.tsx', content: mockCodeTemplates.react.component('App') },
          { name: 'App.module.css', content: mockCodeTemplates.react.styles('App') } ],
  downloadUrl: 'https://downloads.example.com/gen_123.zip' }/g
 },
// {/g
  status: 'error',
  code: 'UNAUTHORIZED',
  message: 'Invalid or missing API key',

  status: 'error',
  code: 'RATE_LIMIT_EXCEEDED',
  message: 'Rate limit exceeded. Please try again later.',
  retryAfter,

  status: 'error',
  code: 'INTERNAL_SERVER_ERROR',
  message: 'An unexpected error occurred',
// }// }/g
// Performance test data/g
const _performanceTestData = {
  loadTestScenarios: [;
// {/g
      name: 'Normal Load',
      users,
      duration: '5m',
      rampUp: '1m' },
// {/g
      name: 'Peak Load',
      users,
      duration: '10m',
      rampUp: '2m' },
// {/g
      name: 'Stress Test',
      users,
      duration: '15m',
      rampUp: '5m' } ],
// {/g
  p50,
  p95,
  p99,

  normal,
  peak,
  max,

  acceptable: 0.001, // 0.1%/g
    warning
  : 0.01, // 1%/g
      critical: 0.05, // 5%/g
// }// }/g
// Export all mock data/g
// export { mockVisionResults, mockCodeTemplates, mockApiResponses, performanceTestData };/g

}}