# Script para registrar un nuevo usuario en la API de OPT
# Uso: .\register-user.ps1 -Rut "12345678-9" -Nombre "Usuario Test" -Email "test@test.com" -Password "password123" -Rol "Admin"

param(
    [string]$Rut = "admin",
    [string]$Nombre = "Administrador",
    [string]$Email = "admin@opt.com",
    [string]$Password = "admin123",
    [string]$Rol = "Admin",
    [int]$TenantId = 1
)

$apiUrl = "http://localhost:5005/api/Auth/register"

$body = @{
    rutUsuario = $Rut
    nombre = $Nombre
    email = $Email
    password = $Password
    rol = $Rol
    tenantId = $TenantId
} | ConvertTo-Json

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REGISTRAR USUARIO - OPT API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL: $apiUrl" -ForegroundColor Gray
Write-Host "RUT: $Rut" -ForegroundColor Gray
Write-Host "Nombre: $Nombre" -ForegroundColor Gray
Write-Host "Email: $Email" -ForegroundColor Gray
Write-Host "Rol: $Rol" -ForegroundColor Gray
Write-Host "Tenant ID: $TenantId" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  USUARIO REGISTRADO EXITOSAMENTE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Respuesta:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
}
catch {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERROR AL REGISTRAR USUARIO" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error:" -ForegroundColor Red
    
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody -ForegroundColor Red
    }
    catch {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para probar el login con este usuario ejecuta:" -ForegroundColor Yellow
Write-Host ".\test-login.ps1 -Rut `"$Rut`" -Password `"$Password`" -TenantId $TenantId" -ForegroundColor White
