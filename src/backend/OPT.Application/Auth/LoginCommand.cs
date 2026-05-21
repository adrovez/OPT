using MediatR;
using OPT.Application.Usuarios.DTOs;

namespace OPT.Application.Auth;

/// <summary>Comando para autenticar un usuario por RUT + contraseña.</summary>
public record LoginCommand(Guid TenantId, string Rut, string Password) : IRequest<LoginResponse>;

/// <summary>Respuesta del login exitoso con el token JWT.</summary>
public record LoginResponse(
    string Token,
    string Nombre,
    string Rol,
    Guid UsuarioId,
    Guid TenantId,
    DateTime Expiracion,
    IReadOnlyList<SucursalResumenDto> Sucursales);
