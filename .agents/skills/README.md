# Agent Skills

Reusable skill modules for AI agents. Each skill is a directory containing a `SKILL.md` file.

## Installed Skills

| Skill | Description | Location |
|-------|-------------|----------|
| angular-developer | Angular development best practices | `../../skills/angular-developer/` |
| angular-new-app | New Angular application setup | `../../skills/angular-new-app/` |
| dotnet-best-practices | .NET coding standards | `../../skills/dotnet-best-practices/` |
| ui-ux-pro-max | UI/UX design guidance | `../../skills/ui-ux-pro-max/` |

## Adding New Skills

1. Create directory: `.agents/skills/skill-name/`
2. Add `SKILL.md` with YAML frontmatter:
   ```yaml
   ---
   name: skill-name
   description: What it does and when to use it
   ---
   ```
3. Optionally add `scripts/`, `references/`, `assets/` subdirectories

## Skill Structure

```
skill-name/
├── SKILL.md         # Required - instructions
├── scripts/         # Optional - helper scripts
├── references/      # Optional - reference docs
└── assets/          # Optional - templates, schemas
```
