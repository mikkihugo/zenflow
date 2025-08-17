// Simple test to verify BootstrapFinetune validation
import { BootstrapFinetune } from './dist/teleprompters/bootstrap-finetune.js';
import { Example } from './dist/primitives/example.js';

// Mock classes
class MockPredictor {
  constructor(name) {
    this.name = name;
    this.demos = [];
    this.lm = { model: 'gpt-4', generate: async () => 'test' };
    this.signature = { instructions: 'Follow instructions carefully.' };
  }
}

class MockModule {
  constructor(name, predictorCount = 1) {
    this.name = name;
    this._predictors = [];
    for (let i = 0; i < predictorCount; i++) {
      this._predictors.push(new MockPredictor(`${name}_predictor_${i}`));
    }
  }

  predictors() {
    return this._predictors;
  }

  async forward(inputs) {
    return { data: { answer: 'test' } };
  }

  reset_copy() {
    return new MockModule(this.name + '_copy', this._predictors.length);
  }

  deepcopy() {
    return new MockModule(this.name + '_deepcopy', this._predictors.length);
  }
}

async function testValidation() {
  console.log('Testing BootstrapFinetune validation...');
  
  const bootstrapFinetune = new BootstrapFinetune();
  const student = new MockModule('student', 1);
  const trainset = [new Example({ question: 'Test?', answer: 'Test!' })];
  
  // Test 1: Different number of predictors
  console.log('\nTest 1: Different predictor count');
  try {
    const teacherWithDifferentCount = new MockModule('teacher', 2); // 2 predictors vs 1
    await bootstrapFinetune.compile(student, {
      trainset,
      teacher: teacherWithDifferentCount
    });
    console.log('❌ Should have thrown error for different predictor count');
  } catch (error) {
    console.log('✅ Correctly caught error:', error.message);
  }
  
  // Test 2: Shared predictors
  console.log('\nTest 2: Shared predictors');
  try {
    const teacherWithSharedPredictors = new MockModule('teacher', 1);
    teacherWithSharedPredictors._predictors = student.predictors(); // Share same objects
    await bootstrapFinetune.compile(student, {
      trainset,
      teacher: teacherWithSharedPredictors
    });
    console.log('❌ Should have thrown error for shared predictors');
  } catch (error) {
    console.log('✅ Correctly caught error:', error.message);
  }
  
  console.log('\nValidation tests complete!');
}

testValidation().catch(console.error);