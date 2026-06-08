using System.Security.Cryptography;
using System.Text;
using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Usuarios.DTOs;

namespace OPT.Application.Auth;

/// <summary>
/// Rota el par JWT + refresh token.
/// Revoca el token presentado y emite un nuevo par.
/// Valida que el token pertenezca al mismo tenant para evitar uso cruzado.
/// </summary>
public class RefreshTokenCommandHandler(
    IRefreshTokenRepository refreshTokenRepository,
    IUsuarioRepository usuarioRepository,
    IJwtService jwtService) : IRequestHandler<RefreshTokenCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var hash = HashToken(request.RefreshToken);
        var storedToken = await refreshTokenRepository.GetActiveByHashAsync(hash, cancellationToken);

        if (storedToken is null || !storedToken.IsActive)
            throw new UnauthorizedAccessException("Refresh token inválido o expirado.");

        if (storedToken.TenantId != request.TenantId)
            throw new UnauthorizedAccessException("Refresh token no corresponde al tenant.");

        var usuario = await usuarioRepository.GetByIdAsync(
            storedToken.UsuarioId, storedToken.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException("Usuario no encontrado.");

        // Rotación: revocar el token presentado y emitir un nuevo par
        await refreshTokenRepository.RevokeAsync(storedToken.RefreshTokenId, cancellationToken);

        var jwt = jwtService.GenerateToken(usuario);
        var newRawToken = jwtService.GenerateRefreshToken();
        var newToken = new OPT.Domain.Entities.RefreshToken
        {
            UsuarioId       = usuario.UsuarioId,
            TenantId        = usuario.TenantId,
            TokenHash       = HashToken(newRawToken),
            FechaExpiracion = DateTime.UtcNow.AddDays(7),
            CreatedAt       = DateTime.UtcNow
        };
        await refreshTokenRepository.AddAsync(newToken, cancellationToken);

        var sucursales = usuario.UsuarioSucursales
            .Where(us => us.Sucursal is not null)
            .Select(us => new SucursalResumenDto(us.Sucursal!.SucursalId, us.Sucursal!.Nombre))
            .ToList();

        return new LoginResponse(
            Token:        jwt.Token,
            RefreshToken: newRawToken,
            Nombre:       usuario.Nombre,
            Rol:          usuario.Rol,
            UsuarioId:    usuario.UsuarioId,
            TenantId:     usuario.TenantId,
            Expiracion:   jwt.ExpiresAt,
            Sucursales:   sucursales);
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}
