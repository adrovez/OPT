namespace OPT.Application.Sucursales.DTOs;

public record SucursalDto(
    Guid SucursalId,
    Guid TenantId,
    string Nombre,
    string? Direccion,
    string? Telefono,
    bool Matriz,
    DateTime FechaRegistro,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy);
