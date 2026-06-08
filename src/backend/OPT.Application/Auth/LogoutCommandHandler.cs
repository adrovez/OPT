using System.Security.Cryptography;
using System.Text;
using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Auth;

/// <summary>
/// Revoca el refresh token presentado.
/// Si el token no existe o ya fue revocado, no hace nada (idempotente).
/// </summary>
public class LogoutCommandHandler(IRefreshTokenRepository refreshTokenRepository)
    : IRequestHandler<LogoutCommand>
{
    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var hash = HashToken(request.RefreshToken);
        var token = await refreshTokenRepository.GetActiveByHashAsync(hash, cancellationToken);
        if (token is not null)
            await refreshTokenRepository.RevokeAsync(token.RefreshTokenId, cancellationToken);
        // Si no existe o ya está revocado: silencioso (idempotente)
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}
