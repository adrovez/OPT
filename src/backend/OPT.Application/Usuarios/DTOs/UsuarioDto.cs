namespace OPT.Application.Usuarios.DTOs;

public record SucursalResumenDto(Guid SucursalId, string Nombre);

public record UsuarioDto(
    Guid UsuarioId,
    Guid TenantId,
    string RutUsuario,
    string Nombre,
    string Email,
    string Rol,
    DateTime FechaIngreso,
    IReadOnlyList<SucursalResumenDto> Sucursales,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy);
