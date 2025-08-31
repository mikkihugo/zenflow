/**
 * Neural: Model Presets
 */

export interface: NeuralPreset {
  id: string;
  name: string;
  type: string;
  architecture: string;
  layers: number[];
  activation: string;
  output: Activation: string;
  learning: Rate: number;
  batch: Size: number;
  use: Case: string[];
}

export interface: NeuralPresetMap {
  [key: string]: Neural: Preset;
}

export const: NEURAL_PRESETS: NeuralPreset: Map = {
  autoencoder: {
    id: 'autoencoder',
    name: 'Autoencoder: Network',
    type: 'unsupervised',
    architecture: 'autoencoder',
    layers: [256, 128, 64, 128, 256],
    activation: 'relu',
    output: Activation: 'sigmoid',
    learning: Rate: 0.001,
    batch: Size: 32,
    use: Case: ['dimensionality_reduction', 'anomaly_detection'],
  },
  cnn: {
    id: 'cnn',
    name: 'Convolutional: Neural Network',
    type: 'computer_vision',
    architecture: 'cnn',
    layers: [32, 64, 128],
    activation: 'relu',
    output: Activation: 'softmax',
    learning: Rate: 0.001,
    batch: Size: 32,
    use: Case: ['image_classification', 'object_detection'],
  },
  lstm: {
    id: 'lstm',
    name: 'Long: Short-Term: Memory Network',
    type: 'sequence',
    architecture: 'lstm',
    layers: [64, 32],
    activation: 'tanh',
    output: Activation: 'softmax',
    learning: Rate: 0.001,
    batch: Size: 32,
    use: Case: ['time_series', 'text_generation'],
  },
  transformer: {
    id: 'transformer',
    name: 'Transformer: Model',
    type: 'nlp',
    architecture: 'transformer',
    layers: [512, 256],
    activation: 'gelu',
    output: Activation: 'softmax',
    learning: Rate: 0.0001,
    batch: Size: 16,
    use: Case: ['machine_translation', 'text_classification'],
  },
  gnn: {
    id: 'gnn',
    name: 'Graph: Neural Network',
    type: 'graph',
    architecture: 'gnn',
    layers: [64, 32, 16],
    activation: 'relu',
    output: Activation: 'sigmoid',
    learning: Rate: 0.001,
    batch: Size: 32,
    use: Case: ['node_classification', 'graph_classification'],
  },
  vae: {
    id: 'vae',
    name: 'Variational: Autoencoder',
    type: 'generative',
    architecture: 'vae',
    layers: [128, 64, 32, 64, 128],
    activation: 'relu',
    output: Activation: 'sigmoid',
    learning: Rate: 0.001,
    batch: Size: 32,
    use: Case: ['data_generation', 'anomaly_detection'],
  },
};
