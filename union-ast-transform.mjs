/**
 * Professional AST transformation for union type quote boundary corruption
 * Uses jscodeshift for reliable TypeScript union type fixing
 */

import fs from 'fs';
import path from 'path';

// Define the jscodeshift transform
function transform(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  
  let hasChanges = false;

  // Transform TypeScript union types in type annotations
  root.find(j.TSUnionType).forEach(path => {
    if (path.value.types) {
      let typeChanged = false;
      
      path.value.types.forEach(type => {
        if (type.type === 'TSLiteralType' && type.literal && type.literal.type === 'StringLiteral') {
          const originalValue = type.literal.value;
          const originalRaw = type.literal.raw;
          
          // Fix corrupted quote boundaries
          if (originalRaw) {
            // Pattern 1: 'high'' -> 'high'
            if (originalRaw.match(/'[^']*''/)) {
              type.literal.raw = originalRaw.replace(/''$/, "'");
              typeChanged = true;
            }
            // Pattern 2: ''medium' -> 'medium'
            if (originalRaw.match(/^''[^']*/)) {
              type.literal.raw = originalRaw.replace(/^''/, "'");
              typeChanged = true;
            }
            // Pattern 3: 'high | medium' -> fix as two separate types
            if (originalValue && originalValue.includes(' | ')) {
              // This needs to be handled at a higher level - split the union
              console.log(`Found multi-value in single literal: ${originalValue}`);
            }
          }
        }
      });
      
      if (typeChanged) {
        hasChanges = true;
      }
    }
  });

  // Transform object type properties with union types
  root.find(j.TSPropertySignature).forEach(path => {
    if (path.value.typeAnnotation && path.value.typeAnnotation.typeAnnotation) {
      const typeAnnotation = path.value.typeAnnotation.typeAnnotation;
      
      if (typeAnnotation.type === 'TSUnionType' && typeAnnotation.types) {
        typeAnnotation.types.forEach(type => {
          if (type.type === 'TSLiteralType' && type.literal && type.literal.type === 'StringLiteral') {
            const originalRaw = type.literal.raw;
            
            if (originalRaw) {
              // Fix quote boundary corruption
              if (originalRaw.match(/'[^']*''/)) {
                type.literal.raw = originalRaw.replace(/''$/, "'");
                hasChanges = true;
              }
              if (originalRaw.match(/^''[^']*/)) {
                type.literal.raw = originalRaw.replace(/^''/, "'");
                hasChanges = true;
              }
            }
          }
        });
      }
    }
  });

  return hasChanges ? root.toSource() : null;
}

// Manual transformation for complex patterns that jscodeshift might miss
function manualPatternFix(content) {
  let fixed = content;
  let changes = 0;

  // Pattern: 'value'' | ''other' -> 'value' | 'other'
  const pattern1 = /'([^']+)''\s*\|\s*''([^']+)'/g;
  fixed = fixed.replace(pattern1, (match, p1, p2) => {
    changes++;
    return `'${p1}' | '${p2}'`;
  });

  // Pattern: 'value1'' | ''value2'' | ''value3' -> 'value1' | 'value2' | 'value3'  
  const pattern2 = /'([^']+)''\s*\|\s*''([^']+)''\s*\|\s*''([^']+)'/g;
  fixed = fixed.replace(pattern2, (match, p1, p2, p3) => {
    changes++;
    return `'${p1}' | '${p2}' | '${p3}'`;
  });

  // Pattern: 'value''' -> 'value'
  const pattern3 = /'([^']+)'''/g;
  fixed = fixed.replace(pattern3, (match, p1) => {
    changes++;
    return `'${p1}'`;
  });

  // Pattern: '''value' -> 'value'
  const pattern4 = /'''([^']+)'/g;
  fixed = fixed.replace(pattern4, (match, p1) => {
    changes++;
    return `'${p1}'`;
  });

  return { content: fixed, changes };
}

// Apply transformation to a single file
async function transformFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { jscodeshift } = await import('jscodeshift');
    
    // First try jscodeshift AST transformation
    const result = transform({ path: filePath, source: content }, { jscodeshift });
    
    let finalContent = result || content;
    let totalChanges = result ? 1 : 0;
    
    // Then apply manual pattern fixes for complex cases
    const manualResult = manualPatternFix(finalContent);
    finalContent = manualResult.content;
    totalChanges += manualResult.changes;
    
    if (totalChanges > 0) {
      fs.writeFileSync(filePath, finalContent);
      console.log(`✅ Fixed ${filePath} (${totalChanges} changes)`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

export { transform, transformFile, manualPatternFix };

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const targetFile = process.argv[2];
  if (targetFile) {
    transformFile(targetFile).then(success => {
      process.exit(success ? 0 : 1);
    });
  } else {
    console.log('Usage: node union-ast-transform.mjs <file-path>');
    process.exit(1);
  }
}