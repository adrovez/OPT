using OPT.Domain.Entities;

namespace OPT.Application.Roles.DTOs;

public static class RolMappingExtensions
{
    public static RolDto ToDto(this Rol r) => new(RolId: r.RolId, Nombre: r.Nombre);
}
