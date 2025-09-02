# @claude-zen/gemini-provider

Event-driven Gemini integration using `@google/gemini-cli-core`.
These changes will significantly improve the quality and maintainability of your `gemini-provider`.
## Usage (in-process)
<!--
- Add to workspace and build
- Register handlers at startup:
[PROMPT_SUGGESTION]Could you explain the benefits of using `@ai-sdk/google` over `@google/gemini-cli-core`?[/PROMPT_SUGGESTION]
- **Performance**: Caches API clients to reduce latency on subsequent requests.

## Getting Started

1.  **Add to workspace and build** the package.
2.  **Register handlers** at your application's startup:

```ts
import { registerGeminiHandlers } from '@claude-zen/gemini-provider'
await registerGeminiHandlers()
```

- Request/response over EventBus with correlationId:
  - Request topics: `llm:gemini:generate:request`, `llm:gemini:chat:request`
  - Response topics: `llm:gemini:generate:response`, `llm:gemini:chat:response`

## Auth

- Set environment: `GEMINI_API_KEY`

## System CLI (optional)

To use Gemini from terminal tools (e.g., RooCode):
- Install CLI globally:
  - `npm i -g @google/gemini-cli` or `brew install gemini-cli` (macOS/Linux)
- Then run `gemini` in any folder.
