# PostToolUse hook (Edit|Write sobre *.cs) — ADVERTENCIA (no bloquea)
# Detecta anti-patrones multi-tenant del proyecto y avisa a Claude para revision.
$ErrorActionPreference = 'Stop'
try {
    $payload = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $path = $payload.tool_input.file_path
    if ($null -eq $path -or $path -notmatch '\.cs$') { exit 0 }
    if (-not (Test-Path $path)) { exit 0 }
    $content = Get-Content -Raw -LiteralPath $path
    $warn = @()
    # Handlers no deben inyectar ICurrentTenantService
    if ($path -match '(?i)Handler\.cs$' -and $content -match 'ICurrentTenantService') {
        $warn += "Un Handler referencia ICurrentTenantService. Los handlers reciben TenantId/SucursalId como campos del command; ese servicio solo va en controllers/middleware."
    }
    # NEWID en C#
    if ($content -match '(?i)Guid\.NewGuid\(\)\.ToString\(\)\s*//?\s*tenant') {
        $warn += "Posible generacion de tenant id en codigo. Revisa el origen del TenantId."
    }
    if ($warn.Count -gt 0) {
        [Console]::Error.WriteLine("tenant-guard (advertencia): " + ($warn -join " | ") + " Revisa antes de continuar.")
        exit 2
    }
}
catch { exit 0 }
exit 0
