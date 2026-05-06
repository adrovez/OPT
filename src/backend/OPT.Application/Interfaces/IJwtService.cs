using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

/// <summary>Genera tokens JWT para usuarios autenticados.</summary>
public interface IJwtService
{
    /// <summary>
    /// Genera un token JWT firmado con claims de TenantId, UsuarioId, RUT y Rol.
    /// </summary>
    string GenerateToken(Usuario usuario);
}
