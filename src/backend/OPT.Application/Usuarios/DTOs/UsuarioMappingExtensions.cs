using OPT.Domain.Entities;

namespace OPT.Application.Usuarios.DTOs;

public static class UsuarioMappingExtensions
{
    public static UsuarioDto ToDto(this Usuario u) => new(
        u.UsuarioId,
        u.TenantId,
        u.RutUsuario,
        u.Nombre,
        u.Email,
        u.Rol,
        u.FechaIngreso,
        u.UsuarioSucursales
            .Where(us => us.Sucursal is not null && !us.Sucursal.IsDeleted)
            .Select(us => new SucursalResumenDto(us.SucursalId, us.Sucursal!.Nombre))
            .ToList(),
        u.CreatedAt,
        u.UpdatedAt,
        u.CreatedBy,
        u.UpdatedBy);
}
