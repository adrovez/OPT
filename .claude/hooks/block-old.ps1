# PreToolUse hook (Edit|Write|MultiEdit) — BLOQUEO DURO
# Regla no negociable: nunca modificar old/.
# Lee el payload JSON del tool por stdin; exit 2 bloquea la accion y envia
# el mensaje de stderr a Claude.
$ErrorActionPreference = 'Stop'
try {
    $payload = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $path = $payload.tool_input.file_path
    if ($null -ne $path -and $path -match '[\\/]old[\\/]') {
        [Console]::Error.WriteLine("BLOQUEADO: 'old/' es codigo legacy de SOLO LECTURA (regla no negociable). Realiza el cambio en 'src/'.")
        exit 2
    }
}
catch {
    # Ante cualquier error de parseo, no bloquear el flujo normal.
    exit 0
}
exit 0
