# Script para validar login contra la API de OPT
# Uso: .\test-login.ps1 -Rut "12345678-9" -Password "password123" -TenantId 1

param(
    [string]$Rut = "admin",
    [string]$Password = "admin123",
    [int]$TenantId = 1
)

$apiUrl = "http://localhost:5005/api/Auth/login"

$body = @{
    rutUsuario = $Rut
    password = $Password
    tenantId = $TenantId
} | ConvertTo-Json

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VALIDANDO LOGIN - OPT API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL: $apiUrl" -ForegroundColor Gray
Write-Host "RUT: $Rut" -ForegroundColor Gray
Write-Host "Tenant ID: $TenantId" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  LOGIN EXITOSO" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Respuesta:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    
    if ($response.token) {
        Write-Host ""
        Write-Host "Token JWT:" -ForegroundColor Yellow
        Write-Host $response.token -ForegroundColor White
    }
}
catch {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERROR DE LOGIN" -ForegroundColor Red
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
