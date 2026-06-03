# PostToolUse hook (Edit|Write) — validacion ligera del area tocada.
# No compila en cada edicion (seria lento); solo recuerda el comando de validacion
# correspondiente segun la carpeta. Devuelve el recordatorio via stderr (exit 2 informativo).
$ErrorActionPreference = 'Stop'
try {
    $payload = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $path = $payload.tool_input.file_path
    if ($null -eq $path) { exit 0 }
    if ($path -match '[\\/]src[\\/]backend[\\/]' -and $path -match '\.cs$') {
        [Console]::Error.WriteLine("Recordatorio: valida el backend con 'dotnet build' del proyecto afectado antes de cerrar la tarea.")
        exit 2
    }
    if ($path -match '[\\/]src[\\/]frontend[\\/]' -and $path -match '\.(ts|html)$') {
        [Console]::Error.WriteLine("Recordatorio: valida el frontend con 'npm run lint' antes de cerrar la tarea.")
        exit 2
    }
}
catch { exit 0 }
exit 0
