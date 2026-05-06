using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace OPT.API.Middleware;

/// <summary>
/// Middleware de validación multi-tenant.
/// Segunda línea de defensa: después de que UseAuthentication() verifica la firma del JWT,
/// este middleware garantiza que el claim <c>tenant_id</c> esté presente y sea un entero válido > 0
/// en todas las rutas que requieren autenticación.
///
/// Protege contra JWTs manipulados que hayan pasado la verificación de firma
/// pero tengan un tenant_id inválido, nulo o cero.
/// </summary>
public class TenantValidationMiddleware(
    RequestDelegate next,
    ILogger<TenantValidationMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task InvokeAsync(HttpContext context)
    {
        // Solo aplica a endpoints que requieren autenticación
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantClaim = context.User.FindFirstValue("tenant_id");

            if (!int.TryParse(tenantClaim, out var tenantId) || tenantId <= 0)
            {
                logger.LogWarning(
                    "TenantId inválido o ausente en JWT para {Method} {Path}. Claim: '{TenantClaim}'",
                    context.Request.Method, context.Request.Path, tenantClaim);

                var problem = new ProblemDetails
                {
                    Status = (int)HttpStatusCode.Forbidden,
                    Title = "Tenant no autorizado",
                    Detail = "El token no contiene un identificador de tenant válido.",
                    Instance = context.Request.Path
                };

                context.Response.ContentType = "application/problem+json";
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;

                await context.Response.WriteAsync(
                    JsonSerializer.Serialize(problem, JsonOptions));
                return;
            }
        }

        await next(context);
    }
}

/// <summary>Extensión para registrar TenantValidationMiddleware en el pipeline.</summary>
public static class TenantValidationMiddlewareExtensions
{
    /// <summary>
    /// Registra la validación de tenant. Debe ir DESPUÉS de UseAuthorization().
    /// </summary>
    public static IApplicationBuilder UseTenantValidation(this IApplicationBuilder app)
        => app.UseMiddleware<TenantValidationMiddleware>();
}
