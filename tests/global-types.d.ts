// Global test utilities interface (auto-generated)
declare global {
  // London TDD utilities
  function createInteractionSpy(name:string): vi.Mock;
  function verifyInteractions(
    spy:vi.Mock,
    expectedCalls:ExpectedCall[]
  ):void;
  function createMockFactory<T>(
    defaults?:Partial<T>
  ):(overrides?: Partial<T>) => T;
  function waitForInteraction(spy:vi.Mock, timeout?:number): Promise<void>;
  function simulateProtocolHandshake(mockProtocol:vi.Mock): void;

  // Classical TDD utilities
  const testStartTime:number;
  const testStartMemory:NodeJS.MemoryUsage | undefined;
  function generateNeuralTestData(config:NeuralTestConfig): NeuralTestData[];
  function expectNearlyEqual(
    actual:number,
    expected:number,
    tolerance?:number
  ):void;
  function createCoordinationMock<T>(
    defaults?:Partial<T>
  ):(overrides?: Partial<T>) => T;

  // Hybrid testing utilities
  function testWithApproach(
    approach: 'london' | 'classical',
    testFn:() => undefined | Promise<void>
  ):void;
  function createMemoryTestScenario(
    type:'sqlite' | 'lancedb' | 'json'
  ):MemoryTestScenario;

  // Node.js garbage collection (optional)
  function gc():void;

  // Custom Vitest matchers
  namespace vi {
    interface Matchers<R> {
      toHaveBeenCalledWithObjectContaining(
        expected:Record<string, unknown>
      ):R;
    }
  }
}

// Supporting types
interface ExpectedCall {
  args:unknown[];
  times?:number;
}

interface NeuralTestConfig {
  type: 'xor' | 'linear' | 'classification';
  size:number;
}

interface NeuralTestData {
  input:number[];
  output:number[];
}

interface MemoryTestScenario {
  setup():Promise<void>;
  cleanup():Promise<void>;
  data:Record<string, unknown>;
}

interface ProtocolResponse {
  type:string;
  success:boolean;
  data?:unknown;
}
