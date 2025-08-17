// Quick validation test for BootstrapFinetune
import { BootstrapFinetune } from './src/teleprompters/bootstrap-finetune';
import { Example } from './src/primitives/example';

// Mock classes - minimal implementation
class MockPredictor {
  name: string;
  demos: any[] = [];
  lm: any;
  signature: any;

  constructor(name: string) {
    this.name = name;
    this.lm = { model: 'gpt-4', generate: async () => 'test' };
    this.signature = { instructions: 'Follow instructions carefully.' };
  }
}

class MockModule {
  name: string;
  private _predictors: MockPredictor[];

  constructor(name: string, predictorCount = 1) {
    this.name = name;
    this._predictors = [];
    for (let i = 0; i < predictorCount; i++) {
      this._predictors.push(new MockPredictor(`${name}_predictor_${i}`));
    }
  }

  predictors() {
    return this._predictors;
  }

  async forward(inputs: any) {
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
  const student = new MockModule('student', 1) as any;
  const trainset = [new Example({ question: 'Test?', answer: 'Test!' })];
  
  // Test 1: Different number of predictors
  console.log('\nTest 1: Different predictor count should throw error');
  try {
    const teacherWithDifferentCount = new MockModule('teacher', 2) as any; // 2 predictors vs 1
    await bootstrapFinetune.compile(student, {
      trainset,
      teacher: teacherWithDifferentCount
    });
    console.log('❌ FAILED: Should have thrown error for different predictor count');
  } catch (error: any) {
    if (error.message.includes('Structurally equivalent programs must have the same number of predictors')) {
      console.log('✅ PASSED: Correctly caught error:', error.message);
    } else {
      console.log('❌ FAILED: Wrong error message:', error.message);
    }
  }
  
  // Test 2: Shared predictors
  console.log('\nTest 2: Shared predictors should throw error');
  try {
    const teacherWithSharedPredictors = new MockModule('teacher', 1) as any;
    teacherWithSharedPredictors._predictors = student.predictors(); // Share same objects
    await bootstrapFinetune.compile(student, {
      trainset,
      teacher: teacherWithSharedPredictors
    });
    console.log('❌ FAILED: Should have thrown error for shared predictors');
  } catch (error: any) {
    if (error.message.includes('The programs share predictor')) {
      console.log('✅ PASSED: Correctly caught error:', error.message);
    } else {
      console.log('❌ FAILED: Wrong error message:', error.message);
    }
  }
  
  console.log('\nValidation tests complete!');
}

testValidation().catch(console.error);