using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Auth;

/// <summary>
/// Maneja la autenticación por RUT + contraseña.
/// Valida credenciales dentro del tenant antes de emitir el JWT.
/// </summary>
public class LoginCommandHandler(
    IUsuarioRepository usuarioRepository,
    IJwtService jwtService,
    IPasswordHasher passwordHasher) : IRequestHandler<LoginCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var usuario = await usuarioRepository.GetByRutAsync(
            request.Rut, request.TenantId, cancellationToken);

        if (usuario is null)
            throw new UnauthorizedAccessException("Credenciales inválidas.");

        var passwordValido = passwordHasher.Verify(request.Password, usuario.PasswordHash);
        if (!passwordValido)
            throw new UnauthorizedAccessException("Credenciales inválidas.");

        var token = jwtService.GenerateToken(usuario);

        return new LoginResponse(
            Token: token,
            Nombre: usuario.Nombre,
            Rol: usuario.Rol,
            UsuarioId: usuario.UsuarioId,
            TenantId: usuario.TenantId,
            Expiracion: DateTime.UtcNow.AddHours(1));
    }
}
