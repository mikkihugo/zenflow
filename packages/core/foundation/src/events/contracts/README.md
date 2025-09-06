# Domain Event Contracts

This directory contains cross-domain event contracts for the foundation event system.

- Mechanics (bus, middleware, metrics, registry, catalog) live in `@claude-zen/foundation`.
- Contracts (typed names and payloads) are now exported from `@claude-zen/foundation/events` as well.

Consumers should import both mechanics and contracts from `@claude-zen/foundation`.
