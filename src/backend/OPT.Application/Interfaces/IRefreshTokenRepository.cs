using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

/// <summary>
/// Contrato de persistencia para refresh tokens.
/// Las búsquedas filtran automáticamente tokens no revocados.
/// </summary>
public interface IRefreshTokenRepository
{
    /// <summary>Busca un token activo (no revocado, no expirado) por su hash.</summary>
    Task<RefreshToken?> GetActiveByHashAsync(string tokenHash, CancellationToken ct);

    /// <summary>Persiste un nuevo refresh token.</summary>
    Task AddAsync(RefreshToken token, CancellationToken ct);

    /// <summary>Revoca un token por su PK (setea FechaRevocacion = UtcNow).</summary>
    Task RevokeAsync(Guid refreshTokenId, CancellationToken ct);

    /// <summary>Revoca todos los tokens activos de un usuario en un tenant.</summary>
    Task RevokeAllForUserAsync(Guid usuarioId, Guid tenantId, CancellationToken ct);
}
