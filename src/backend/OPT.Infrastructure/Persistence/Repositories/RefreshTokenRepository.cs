using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repositorio de refresh tokens. Opera directamente sobre OPTDbContext
/// porque los tokens no tienen soft delete — la revocación usa FechaRevocacion.
/// </summary>
public class RefreshTokenRepository(OPTDbContext context) : IRefreshTokenRepository
{
    public async Task<RefreshToken?> GetActiveByHashAsync(string tokenHash, CancellationToken ct)
        => await context.RefreshTokens
            .FirstOrDefaultAsync(t =>
                t.TokenHash == tokenHash &&
                t.FechaRevocacion == null &&
                t.FechaExpiracion > DateTime.UtcNow, ct);

    public async Task AddAsync(RefreshToken token, CancellationToken ct)
    {
        context.RefreshTokens.Add(token);
        await context.SaveChangesAsync(ct);
    }

    public async Task RevokeAsync(Guid refreshTokenId, CancellationToken ct)
    {
        var token = await context.RefreshTokens.FindAsync([refreshTokenId], ct);
        if (token is null) return;
        token.FechaRevocacion = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);
    }

    public async Task RevokeAllForUserAsync(Guid usuarioId, Guid tenantId, CancellationToken ct)
        => await context.RefreshTokens
            .Where(t => t.UsuarioId == usuarioId &&
                        t.TenantId  == tenantId  &&
                        t.FechaRevocacion == null)
            .ExecuteUpdateAsync(
                s => s.SetProperty(t => t.FechaRevocacion, DateTime.UtcNow), ct);
}
