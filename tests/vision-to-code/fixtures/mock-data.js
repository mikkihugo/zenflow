/**
 * Mock data fixtures for Vision-to-Code tests
 */

// Sample images for different test scenarios
export const mockImages = {
  valid: {
    small: {
      name: 'small-ui.png',
      size: 102400, // 100KB
      type: 'image/png',
      dimensions: { width: 400, height: 300 },
    },
    medium: {
      name: 'medium-dashboard.jpg',
      size: 512000, // 500KB
      type: 'image/jpeg',
      dimensions: { width: 1200, height: 800 },
    },
    large: {
      name: 'large-app.webp',
      size: 2097152, // 2MB
      type: 'image/webp',
      dimensions: { width: 1920, height: 1080 },
    },
  },
  invalid: {
    corrupted: {
      name: 'corrupted.png',
      error: 'Invalid image format',
    },
    oversized: {
      name: 'oversized.jpg',
      size: 10485760, // 10MB
      error: 'File size exceeds limit',
    },
    wrongFormat: {
      name: 'document.pdf',
      type: 'application/pdf',
      error: 'Unsupported file format',
    },
  },
};

// Mock vision analysis results
const mockVisionResults = {
  simpleLayout: {
    components: [
      {
        type: 'header',
        bounds: { x: 0, y: 0, width: 1200, height: 80 },
        confidence: 0.98,
        children: ['logo', 'navigation'],
      },
      {
        type: 'hero',
        bounds: { x: 0, y: 80, width: 1200, height: 400 },
        confidence: 0.95,
        children: ['heading', 'subheading', 'cta-button'],
      },
      {
        type: 'content',
        bounds: { x: 0, y: 480, width: 1200, height: 600 },
        confidence: 0.97,
        children: ['card-grid'],
      },
    ],
    layout: {
      type: 'single-column',
      responsive: true,
      breakpoints: ['mobile', 'tablet', 'desktop'],
    },
    design: {
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
        text: '#333333',
      },
      typography: {
        headingFont: 'sans-serif',
        bodyFont: 'sans-serif',
        baseFontSize: 16,
      },
    },
  },
  complexLayout: {
    components: [
      {
        type: 'sidebar',
        bounds: { x: 0, y: 0, width: 250, height: 1080 },
        confidence: 0.96,
        children: ['logo', 'nav-menu', 'user-profile'],
      },
      {
        type: 'main-content',
        bounds: { x: 250, y: 0, width: 950, height: 1080 },
        confidence: 0.97,
        children: ['toolbar', 'data-grid', 'pagination'],
      },
    ],
    layout: {
      type: 'dashboard',
      responsive: false,
      fixedWidth: 1200,
    },
  },
};

// Mock code generation templates
const mockCodeTemplates = {
  react: {
    component: (name) => `import React from 'react';
import styles from './${name}.module.css';

interface ${name}Props {
  className?: string;
}

export const ${name}: React.FC<${name}Props> = ({ className }) => {
  return (
    <div className={\`\${styles.container} \${className || ''}\`}>
      {/* ${name} content */}
    </div>
  );
};

export default ${name};`,

    styles: (name) => `.container {
  /* ${name} styles */
}`,

    test: (name) => `import React from 'react';
import { render, screen } from '@testing-library/react';
import ${name} from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});`,
  },

  vue: {
    component: (name) => `<template>
  <div class="${name.toLowerCase()}">
    <!-- ${name} content -->
  </div>
</template>

<script>
export default {
  name: '${name}',
  props: {
    className: String
  }
};
</script>

<style scoped>
.${name.toLowerCase()} {
  /* ${name} styles */
}
</style>`,
  },
};

// Mock user data
export const mockUsers = {
  authenticated: {
    id: 'user_123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'developer',
    subscription: 'pro',
    apiKey: 'sk_test_1234567890',
    limits: {
      monthlyImages: 1000,
      concurrentRequests: 10,
      maxImageSize: 5242880, // 5MB
    },
  },

  freeUser: {
    id: 'user_456',
    email: 'free@example.com',
    name: 'Free User',
    role: 'user',
    subscription: 'free',
    limits: {
      monthlyImages: 100,
      concurrentRequests: 2,
      maxImageSize: 2097152, // 2MB
    },
  },
};

// Mock API responses
const mockApiResponses = {
  success: {
    upload: {
      status: 'success',
      data: {
        imageId: 'img_123',
        uploadUrl: 'https://storage.example.com/img_123',
        processingStatus: 'queued',
      },
    },

    analysis: {
      status: 'success',
      data: {
        analysisId: 'analysis_123',
        imageId: 'img_123',
        result: mockVisionResults.simpleLayout,
        processingTime: 245,
      },
    },

    generation: {
      status: 'success',
      data: {
        generationId: 'gen_123',
        analysisId: 'analysis_123',
        framework: 'react',
        files: [
          { name: 'App.tsx', content: mockCodeTemplates.react.component('App') },
          { name: 'App.module.css', content: mockCodeTemplates.react.styles('App') },
        ],
        downloadUrl: 'https://downloads.example.com/gen_123.zip',
      },
    },
  },

  errors: {
    unauthorized: {
      status: 'error',
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing API key',
      },
    },

    rateLimit: {
      status: 'error',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: 60,
      },
    },

    serverError: {
      status: 'error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    },
  },
};

// Performance test data
const performanceTestData = {
  loadTestScenarios: [
    {
      name: 'Normal Load',
      users: 100,
      duration: '5m',
      rampUp: '1m',
    },
    {
      name: 'Peak Load',
      users: 1000,
      duration: '10m',
      rampUp: '2m',
    },
    {
      name: 'Stress Test',
      users: 5000,
      duration: '15m',
      rampUp: '5m',
    },
  ],

  expectedMetrics: {
    responseTime: {
      p50: 50,
      p95: 100,
      p99: 200,
    },
    throughput: {
      normal: 1000,
      peak: 5000,
      max: 10000,
    },
    errorRate: {
      acceptable: 0.001, // 0.1%
      warning: 0.01, // 1%
      critical: 0.05, // 5%
    },
  },
};

// Export all mock data
export { mockVisionResults, mockCodeTemplates, mockApiResponses, performanceTestData };
