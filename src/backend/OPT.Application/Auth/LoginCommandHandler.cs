using System.Security.Cryptography;
using System.Text;
using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Usuarios.DTOs;

namespace OPT.Application.Auth;

/// <summary>
/// Maneja la autenticación por RUT + contraseña.
/// Valida credenciales dentro del tenant antes de emitir el JWT y un refresh token.
/// </summary>
public class LoginCommandHandler(
    IUsuarioRepository usuarioRepository,
    IJwtService jwtService,
    IPasswordHasher passwordHasher,
    IRefreshTokenRepository refreshTokenRepository) : IRequestHandler<LoginCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var usuario = await usuarioRepository.GetByRutAsync(
            request.Rut, request.TenantId, cancellationToken);

        if (usuario is null)
            throw new UnauthorizedAccessException("Credenciales inválidas.");

        if (!passwordHasher.Verify(request.Password, usuario.PasswordHash))
            throw new UnauthorizedAccessException("Credenciales inválidas.");

        var jwt = jwtService.GenerateToken(usuario);
        var rawRefreshToken = jwtService.GenerateRefreshToken();
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(rawRefreshToken));

        var refreshToken = new OPT.Domain.Entities.RefreshToken
        {
            UsuarioId       = usuario.UsuarioId,
            TenantId        = usuario.TenantId,
            TokenHash       = Convert.ToHexString(hash),
            FechaExpiracion = DateTime.UtcNow.AddDays(7),
            CreatedAt       = DateTime.UtcNow
        };
        await refreshTokenRepository.AddAsync(refreshToken, cancellationToken);

        var sucursales = usuario.UsuarioSucursales
            .Where(us => us.Sucursal is not null)
            .Select(us => new SucursalResumenDto(us.Sucursal!.SucursalId, us.Sucursal!.Nombre))
            .ToList();

        return new LoginResponse(
            Token:        jwt.Token,
            RefreshToken: rawRefreshToken,
            Nombre:       usuario.Nombre,
            Rol:          usuario.Rol,
            UsuarioId:    usuario.UsuarioId,
            TenantId:     usuario.TenantId,
            Expiracion:   jwt.ExpiresAt,
            Sucursales:   sucursales);
    }
}
