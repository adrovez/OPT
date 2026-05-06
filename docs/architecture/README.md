# Architecture Documentation

System architecture, design decisions, and technical diagrams for OPT.

## Structure

```
docs/architecture/
├── README.md              # This file
├── system-overview.md     # High-level architecture
├── adr/                   # Architecture Decision Records
│   └── 001-example.md
├── diagrams/              # Architecture diagrams
└── migration-plan.md      # Legacy migration strategy
```

## Architecture Decision Records (ADR)

Each ADR follows this format:

```markdown
# ADR-XXX: [Title]

**Status**: Proposed | Accepted | Deprecated | Superseded
**Date**: YYYY-MM-DD
**Context**: [What problem are we solving?]
**Options**: [What alternatives did we consider?]
**Decision**: [What did we choose and why?]
**Consequences**: [What are the trade-offs?]
```

## Diagrams

Store architecture diagrams in `diagrams/`. Prefer:
- Markdown-based diagrams (Mermaid) for version control
- SVG for complex diagrams
- Source files (draw.io, etc.) alongside exports

## System Overview

> Document the high-level architecture here once decided.
> Include: components, data flow, technology choices, deployment model.
