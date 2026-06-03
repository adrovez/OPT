# PostToolUse hook (Edit|Write sobre *.sql)
# NEWID() como DEFAULT -> BLOQUEO (exit 2). Otros patrones -> advertencia (exit 2 informativo).
$ErrorActionPreference = 'Stop'
try {
    $payload = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $path = $payload.tool_input.file_path
    if ($null -eq $path -or $path -notmatch '\.sql$') { exit 0 }
    if (-not (Test-Path $path)) { exit 0 }
    $content = Get-Content -Raw -LiteralPath $path
    $issues = @()
    if ($content -match '(?i)DEFAULT\s+NEWID\s*\(') {
        $issues += "Usa NEWSEQUENTIALID() como DEFAULT, nunca NEWID() (fragmenta el indice clustered)."
    }
    if ($content -match '(?im)^\s*DELETE\s+FROM\s+OPT_') {
        $issues += "Detectado DELETE fisico sobre tabla OPT_. El proyecto usa soft delete (IsDeleted = 1)."
    }
    if ($content -match "(?i)(password|secret|pwd)\s*=\s*'[^']+'") {
        $issues += "Posible secreto hardcodeado en el script SQL. No incluir credenciales."
    }
    if ($issues.Count -gt 0) {
        [Console]::Error.WriteLine("sql-guard: revisa el script:`n - " + ($issues -join "`n - "))
        exit 2
    }
}
catch { exit 0 }
exit 0
