using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using OPT.Application.Interfaces;

namespace OPT.Infrastructure.Auth;

/// <summary>
/// Extrae TenantId y RutUsuario del token JWT en el HttpContext actual.
/// Garantiza que cada request opere solo sobre los datos del tenant autenticado.
/// </summary>
public class CurrentTenantService(IHttpContextAccessor httpContextAccessor) : ICurrentTenantService
{
    public int TenantId
    {
        get
        {
            var claim = httpContextAccessor.HttpContext?.User
                .FindFirstValue("tenant_id");

            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out var tenantId))
                throw new InvalidOperationException("No hay usuario autenticado o el TenantId es inválido.");

            return tenantId;
        }
    }

    public string RutUsuario
    {
        get
        {
            var rut = httpContextAccessor.HttpContext?.User
                .FindFirstValue("rut_usuario");

            return rut ?? throw new InvalidOperationException("No hay usuario autenticado.");
        }
    }
}
