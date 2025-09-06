# Domain Event Contracts

This directory contains cross-domain event contracts that used to live in `@claude-zen/events`.

- Mechanics (bus, middleware, metrics, registry, catalog) live in `@claude-zen/foundation`.
- Contracts (typed names and payloads) are now exported from `@claude-zen/foundation/events` as well.

Consumers should import both mechanics and contracts from `@claude-zen/foundation`.
