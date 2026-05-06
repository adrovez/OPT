using MediatR;

namespace OPT.Application.Auth;

/// <summary>Comando para autenticar un usuario por RUT + contraseña.</summary>
public record LoginCommand(int TenantId, string Rut, string Password) : IRequest<LoginResponse>;

/// <summary>Respuesta del login exitoso con el token JWT.</summary>
public record LoginResponse(
    string Token,
    string Nombre,
    string Rol,
    int UsuarioId,
    int TenantId,
    DateTime Expiracion);
