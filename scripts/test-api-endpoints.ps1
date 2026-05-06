# Script para probar todos los endpoints de la API de OPT
# Verifica que el backend esté funcionando correctamente

$baseUrl = "http://localhost:5005"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRUEBA DE ENDPOINTS - OPT API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para hacer peticiones
function Test-Endpoint {
    param($Method, $Endpoint, $Body = $null)
    
    $url = "$baseUrl$Endpoint"
    Write-Host "Probando: $Method $Endpoint" -ForegroundColor Gray
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $url -Method $Method -Body $Body -ContentType "application/json" -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $Method -ErrorAction Stop
        }
        Write-Host "  [OK] Status: 200" -ForegroundColor Green
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  [ERROR] Status: $statusCode" -ForegroundColor Red
        return $null
    }
}

# 1. Health Check (si existe)
Write-Host "1. Health Check..." -ForegroundColor Yellow
Test-Endpoint -Method Get -Endpoint "/health"

# 2. Swagger
Write-Host ""
Write-Host "2. Swagger UI..." -ForegroundColor Yellow
Test-Endpoint -Method Get -Endpoint "/swagger/index.html"

# 3. Auth - Login (debería fallar con credenciales incorrectas)
Write-Host ""
Write-Host "3. Auth - Login (prueba)..." -ForegroundColor Yellow
$loginBody = @{ rutUsuario = "test"; password = "test" } | ConvertTo-Json
Test-Endpoint -Method Post -Endpoint "/api/Auth/login" -Body $loginBody

# 4. Clientes (debería requerir auth)
Write-Host ""
Write-Host "4. Clientes - Get All..." -ForegroundColor Yellow
Test-Endpoint -Method Get -Endpoint "/api/Clientes"

# 5. Tenants
Write-Host ""
Write-Host "5. Tenants - Get All..." -ForegroundColor Yellow
Test-Endpoint -Method Get -Endpoint "/api/Tenants"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
