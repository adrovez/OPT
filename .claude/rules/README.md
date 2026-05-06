# Claude Code Rules

This directory contains path-scoped rules for Claude Code. Rules here load conditionally based on the files being edited.

## How It Works

- Files in this directory can include `paths` frontmatter to scope when they activate
- Rules without `paths` load unconditionally
- More specific rules take precedence

## Example Rule File

```markdown
---
paths:
  - src/frontend/**/*
---
# Frontend Rules
- Use functional components
- Keep components under 150 lines
```
