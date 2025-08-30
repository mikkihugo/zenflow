# Local CPU Embedding Support for Vector RAG Backend

## Overview

The Vector RAG backend now supports **real local CPU embedding generation** without external API dependencies, enabling true offline operation for semantic search capabilities.

## Supported Models

### Recommended Local CPU Models

| Model | Dimensions | Size | Use Case |
|-------|------------|------|----------|
| `all-MiniLM-L6-v2` | 384 | 23MB | Fastest, good quality |
| `all-mpnet-base-v2` | 768 | 438MB | Best quality, slower |
| `paraphrase-MiniLM-L6-v2` | 384 | 23MB | Optimized for paraphrases |
| `multi-qa-MiniLM-L6-cos-v1` | 384 | 23MB | Optimized for Q&A |

### Model Architecture Support

- **Transformers.js**: Browser-compatible local inference (preferred)
- **ONNX Runtime**: High-performance native inference (future enhancement)
- **API Fallback**: Remote Sentence Transformers endpoint
- **Deterministic Fallback**: Hash-based embeddings for reliability

## Configuration

### Basic Local CPU Configuration

```typescript
const vectorRAGConfig: VectorRAGConfig = {
  backend: 'vector-rag',
  embeddingModel: 'local-cpu',
  localEmbeddingModel: 'all-MiniLM-L6-v2',
  vectorDimensions: 384,
  transformersCacheDir: './models_cache',
  lancedbDatabase: 'knowledge_vectors',
  similarityThreshold: 0.7,
  hybridSearchWeight: 0.3,
  enableArchitecturalKnowledge: true,
};
```

### Environment Variables

```bash
# Local embedding model (default: all-MiniLM-L6-v2)
LOCAL_EMBEDDING_MODEL=all-MiniLM-L6-v2

# Cache directory for downloaded models (default: ./models_cache)
TRANSFORMERS_CACHE_DIR=/path/to/models_cache

# Optional: Remote API fallback endpoints
SENTENCE_TRANSFORMERS_ENDPOINT=http://localhost:8000/embed
LOCAL_EMBEDDING_ENDPOINT=http://localhost:9000/embed
```

## Multi-Tier Embedding Strategy

The Vector RAG backend uses a sophisticated multi-tier approach:

### 1. Real Local CPU Inference (Transformers.js)
- **Primary method** for offline operation
- Downloads and caches models automatically
- Runs entirely within Node.js process
- No external dependencies once models are cached

```typescript
// Automatically initializes and caches model
const embedding = await embeddingService.generateEmbedding("architectural decision");
```

### 2. ONNX Runtime (Future Enhancement)
- High-performance native inference
- Optimized for production workloads
- Currently planned for future implementation

### 3. Remote API Fallback
- Falls back to external Sentence Transformers API
- Useful for development and testing
- Configurable endpoint

### 4. Deterministic Fallback
- Hash-based embedding generation
- Ensures system reliability when all other methods fail
- Maintains consistent behavior

## Performance Characteristics

### Local CPU Embedding Performance

| Model | First Load | Subsequent Calls | Memory Usage |
|-------|------------|------------------|--------------|
| all-MiniLM-L6-v2 | 2-5 seconds | 10-50ms | ~100MB |
| all-mpnet-base-v2 | 5-10 seconds | 50-200ms | ~500MB |

### Optimization Features

- **Model Caching**: Downloaded models are cached locally
- **Lazy Loading**: Models load on first use to reduce startup time
- **Batch Processing**: Supports efficient batch embedding generation
- **Dimension Validation**: Automatic dimension matching and resizing

## Usage Examples

### Basic Vector RAG with Local Embeddings

```typescript
import { VectorRAGBackend } from './vector-rag-backend';

const backend = new VectorRAGBackend({
  backend: 'vector-rag',
  embeddingModel: 'local-cpu',
  localEmbeddingModel: 'all-MiniLM-L6-v2',
  vectorDimensions: 384,
  lancedbDatabase: 'knowledge',
  similarityThreshold: 0.75,
  hybridSearchWeight: 0.3,
  enableArchitecturalKnowledge: true,
});

await backend.initialize();

// Store architectural knowledge with automatic embedding
await backend.store({
  id: 'coordination-pattern',
  query: 'How should agents coordinate in swarms?',
  result: {
    pattern: 'Multi-level orchestration',
    description: 'Use coordinator, worker, specialist agent types',
  },
  knowledgeType: 'architectural-decision',
});

// Semantic search with local embeddings
const results = await backend.search({
  query: 'agent coordination strategies',
  maxResults: 5,
});
```

### Advanced Configuration for Production

```typescript
const productionConfig: VectorRAGConfig = {
  backend: 'vector-rag',
  embeddingModel: 'local-cpu',
  localEmbeddingModel: 'all-mpnet-base-v2', // Higher quality model
  vectorDimensions: 768,
  transformersCacheDir: '/var/cache/transformers',
  lancedbDatabase: '/data/knowledge_vectors',
  vectorTableName: 'embeddings',
  similarityThreshold: 0.8,
  maxVectorResults: 20,
  hybridSearchWeight: 0.2, // Prefer semantic search
  enableArchitecturalKnowledge: true,
  architecturalDocsPath: '/docs/architecture',
};
```

## Architectural Integration

### Agent Coordination Knowledge

The Vector RAG backend automatically ingests architectural knowledge including:

- **Agent Types**: coordinator, worker, specialist, monitor, proxy
- **Coordination Patterns**: Multi-level orchestration, swarm coordination
- **Architectural Decisions**: Key system design decisions
- **Code Patterns**: Reusable implementation patterns

### Event-Driven Architecture

Local embedding generation emits events for agent coordination:

```typescript
backend.on('vector-rag:embedding:generated', (event) => {
  console.log(`Generated ${event.vectorDimensions}D embedding for ${event.id}`);
});

backend.on('vector-rag:search:completed', (event) => {
  console.log(`Semantic search returned ${event.resultsCount} results in ${event.searchTimeMs}ms`);
});
```

## Offline Operation

With local CPU embeddings, the Vector RAG backend provides:

- **Complete offline capability** once models are downloaded
- **No external API dependencies** for core functionality
- **Consistent behavior** across different deployment environments
- **Privacy-preserving** embedding generation

## Migration from API-based Embeddings

### Migrating from OpenAI Embeddings

```typescript
// Old configuration
const oldConfig = {
  embeddingModel: 'text-embedding-ada-002',
  vectorDimensions: 1536,
};

// New local CPU configuration
const newConfig = {
  embeddingModel: 'local-cpu',
  localEmbeddingModel: 'all-mpnet-base-v2',
  vectorDimensions: 768, // Different dimension for local model
};
```

### Batch Re-embedding Existing Data

```typescript
// Re-embed existing knowledge with local models
const existingEntries = await backend.search({ query: '*', maxResults: 1000 });

for (const entry of existingEntries) {
  // Force re-embedding with local model
  delete entry.embedding;
  await backend.store(entry);
}
```

## Troubleshooting

### Common Issues

1. **Model Download Fails**
   - Check internet connectivity during first use
   - Verify `transformersCacheDir` write permissions
   - Ensure sufficient disk space (500MB+ for larger models)

2. **High Memory Usage**
   - Use smaller models like `all-MiniLM-L6-v2`
   - Configure appropriate Node.js heap size
   - Monitor memory usage in production

3. **Slow Performance**
   - Models load once then cache in memory
   - Use batch operations for multiple embeddings
   - Consider ONNX runtime for production workloads

### Debug Configuration

```bash
# Enable debug logging
DEBUG=VectorRAGBackend,SentenceTransformersEmbeddingService

# Monitor model loading
TRANSFORMERS_VERBOSE=1
```

## Future Enhancements

- **ONNX Runtime Integration**: High-performance native inference
- **Model Quantization**: Reduced memory usage with minimal quality loss
- **GPU Acceleration**: CUDA support for faster embedding generation
- **Custom Model Support**: Load user-trained sentence transformer models
- **Embedding Compression**: Reduced storage requirements for large knowledge bases