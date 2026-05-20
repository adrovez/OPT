using OPT.Domain.Entities;

namespace OPT.Application.Sucursales.DTOs;

public static class SucursalMappingExtensions
{
    public static SucursalDto ToDto(this Sucursal s) => new(
        s.SucursalId,
        s.TenantId,
        s.Nombre,
        s.Direccion,
        s.Telefono,
        s.Matriz,
        s.FechaRegistro,
        s.CreatedAt,
        s.UpdatedAt,
        s.CreatedBy,
        s.UpdatedBy);
}
