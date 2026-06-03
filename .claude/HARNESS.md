# Harness de Agentes IA — OPT

Este directorio (`.claude/`) es el **harness ejecutable** del proyecto: la
configuracion que determina como trabajan los agentes de IA (Claude) sobre el
repo, de forma segura y consistente. El contexto narrativo vive en `CLAUDE.md`
y `AGENTS.md` (raiz); aqui esta la parte automatica.

## Componentes

### `agents/` — subagentes especializados
| Agente | Ambito | Herramientas |
|--------|--------|--------------|
| `backend-developer` | `src/backend/` (.NET 10, CQRS, EF Core) | Read/Edit/Write/Grep/Glob/Bash |
| `frontend-developer` | `src/frontend/` (Angular 21, Signal Forms) | Read/Edit/Write/Grep/Glob/Bash |
| `migration-analyst` | `old/` (solo lectura, produce planes) | Read/Grep/Glob |
| `documentation-writer` | `docs/`, `.agents/` | Read/Edit/Write/Grep/Glob |

Cada agente carga sus reglas y checklist al invocarse, evitando que un mismo
contexto mezcle responsabilidades de backend y frontend.

### `hooks/` — guardrails automaticos (PowerShell, Windows)
| Hook | Evento | Accion |
|------|--------|--------|
| `block-old.ps1` | PreToolUse (Edit/Write) | **Bloquea** cualquier edicion dentro de `old/`. |
| `sql-guard.ps1` | PostToolUse (`*.sql`) | **Bloquea** `NEWID()` como DEFAULT; advierte DELETE fisico y secretos. |
| `tenant-guard.ps1` | PostToolUse (`*.cs`) | **Advierte** si un Handler inyecta `ICurrentTenantService` u otros anti-patrones multi-tenant. |
| `post-edit-validate.ps1` | (opt-in, no cableado) | Recordatorio de `dotnet build` / `npm run lint`. Activar en `settings.json` si se desea. |

Convencion: `exit 2` envia el mensaje de stderr a Claude. En PreToolUse ademas
**bloquea** la accion; en PostToolUse actua como feedback/advertencia.

### `rules/` — reglas path-scoped
Se cargan solo al tocar archivos que coinciden con `paths`:
`backend.md` (src/backend/**), `frontend.md` (src/frontend/**),
`basedatos.md` (src/basedatos/**).

### `settings.json` — permisos + wiring de hooks
- `permissions.allow`: comandos de validacion por patron (dotnet, npm, ng, sqlcmd).
- `permissions.deny`: `old/**` (refuerza el hook) y `appsettings*.json` (evita
  leer secretos; quitar si interfiere con configuracion legitima).
- `hooks`: registra block-old (Pre) + sql-guard/tenant-guard (Post).

## Activar `post-edit-validate` (opcional)
Agregar a `settings.json > hooks > PostToolUse > hooks[]`:
```json
{ "type": "command", "command": "powershell -NoProfile -ExecutionPolicy Bypass -File \"$CLAUDE_PROJECT_DIR/.claude/hooks/post-edit-validate.ps1\"" }
```

## Notas
- Entorno: Windows + PowerShell. Si se migra a otro SO, reescribir los `.ps1`.
- `settings.json.bak` conserva la version previa de permisos por si se necesita rollback.
- VS Code: ver `.vscode/` (extensiones recomendadas, tasks de build/lint, exclusiones).
