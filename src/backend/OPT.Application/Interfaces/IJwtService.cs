using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

/// <summary>Resultado de la generación de un JWT: token firmado y fecha de expiración.</summary>
public record JwtTokenResult(string Token, DateTime ExpiresAt);

/// <summary>Genera tokens JWT y refresh tokens para usuarios autenticados.</summary>
public interface IJwtService
{
    /// <summary>
    /// Genera un token JWT firmado con claims de TenantId, UsuarioId, RUT y Rol.
    /// Devuelve el token y su fecha de expiración exacta tomada del JWT.
    /// </summary>
    JwtTokenResult GenerateToken(Usuario usuario);

    /// <summary>
    /// Genera un refresh token criptográficamente seguro (64 bytes en Base64).
    /// </summary>
    string GenerateRefreshToken();
}
