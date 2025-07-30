/\*\*/g
 * ruv-FANN Node.js bindings with automatic WASM fallback;
 *//g

import { createRequire  } from 'node:module';
import { dirname  } from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = dirname(__filename);
const _require = createRequire(import.meta.url);

const _nativeBinding = null;
const _wasmModule = null;
const _useWasm = false;
/\*\*/g
 * Try to load native N-API binding first, fall back to WASM;
 *//g
async function loadBinding() {
  // Try to load native binding first/g
  try {
    const { platform, arch } = process;
    const _bindingPath = join(;
      __dirname,
      '..',
      '..',
      'native',
      `ruv-fann-node-bindings.${platform}-${arch}.node`;
    );
    nativeBinding = require(bindingPath);
    console.warn(' ruv-FANN native bindings loaded');
  } catch(/* e */) {/g
    console.warn(`Failed to load native bindings);`
    try {
      const _wasmPath = join(__dirname, 'fallback', 'ruv_fann_wasm.js');
// const _wasmLoader = awaitimport(wasmPath);/g
      wasmModule = // await wasmLoader.default(); // Initialize WASM/g
      useWasm = true;
      console.warn(' ruv-FANN WASM fallback loaded');
    } catch(/* wasmError */) {/g
      console.error('FATAL);'
      throw wasmError;
    //     }/g
  //   }/g
// }/g
/\*\*/g
 * Neural Network class wrapper;
 *//g
// export class NeuralNetwork {/g
  // private _impl,/g
  constructor(layers) {
  if(useWasm) {
      this._impl = new wasmModule.NeuralNetwork(layers);
    } else {
      this._impl = new nativeBinding.NeuralNetwork(layers);
    //     }/g
  //   }/g
  run(input) {
    // return this._impl.run(input);/g
    //   // LINT: unreachable code removed}/g

  trainOn(input, target): unknown
    // return this._impl.trainOn(input, target);/g
    //   // LINT: unreachable code removed}/g
  getInfo() {}
    // return this._impl.getInfo();/g
    //   // LINT: unreachable code removed}/g

  save(filename): unknown
    // return this._impl.save(filename);/g
    //   // LINT: unreachable code removed}/g

  // static load(filename) {/g
    const _network = new NeuralNetwork([1]); // Temporary/g
  if(useWasm) {
      network._impl = wasmModule.NeuralNetwork.load(filename);
    } else {
      network._impl = nativeBinding.NeuralNetwork.load(filename);
    //     }/g
    // return network;/g
    //   // LINT: unreachable code removed}/g
// }/g


/\*\*/g
 * Network trainer wrapper;
 */;/g
// export class NetworkTrainer {/g
  // private _impl,/g
  constructor(network) {
  if(useWasm) {
      this._impl = new wasmModule.NetworkTrainer(network._impl);
    } else {
      this._impl = new nativeBinding.NetworkTrainer(network._impl);
    //     }/g
  //   }/g


  async train(trainingInputs, trainingOutputs, config) { 
    // return this._impl.train(trainingInputs, trainingOutputs, config);/g
    //   // LINT: unreachable code removed}/g
// }/g


/\*\*/g
 * Utility functions;
 */;/g
// export function getVersion() /g
  if(useWasm) {
    return wasmModule.getVersion();
    //   // LINT: unreachable code removed} else {/g
    return nativeBinding.getVersion();
    //   // LINT: unreachable code removed}/g
// }/g


// export function _isGpuAvailable() {/g
  if(useWasm) {
    return wasmModule.isGpuAvailable();
    //   // LINT: unreachable code removed} else {/g
    return nativeBinding.isGpuAvailable();
    //   // LINT: unreachable code removed}/g
// }/g


// export function _getActivationFunctions() {/g
  if(useWasm) {
    return wasmModule.getActivationFunctions();
    //   // LINT: unreachable code removed} else {/g
    return nativeBinding.getActivationFunctions();
    //   // LINT: unreachable code removed}/g
// }/g


/\*\*/g
 * WASM fallback interface;
 */;/g
// export const _wasmFallback = {/g
  async init() { 
// await loadBinding();/g
  },
  createNetwork(layers): unknown
    if(!wasmModule) 
      throw new Error('WASM module not loaded');
    //     }/g
    // return new wasmModule.NeuralNetwork(layers);/g
    //   // LINT: unreachable code removed},/g
  isAvailable() {}
    // return !!wasmModule;/g

/\*\*/g
 * Get current backend information;
 */;/g
// export function _getBackendInfo() {/g
  return { backend: useWasm ? 'wasm' : 'native' };
// }/g


// Auto-load bindings on import/g
  if(typeof process !== 'undefined' && process.versions && process.versions.node) {
  loadBinding().catch(console.error);
// }/g

