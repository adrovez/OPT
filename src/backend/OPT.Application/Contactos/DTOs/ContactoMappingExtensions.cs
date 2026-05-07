using OPT.Domain.Entities;

namespace OPT.Application.Contactos.DTOs;

/// <summary>Extensiones para mapear entre entidad Contacto y ContactoDto.</summary>
public static class ContactoMappingExtensions
{
    public static ContactoDto ToDto(this Contacto c) => new(
        ContactoId: c.ContactoId,
        TenantId: c.TenantId,
        ClienteId: c.ClienteId,
        Nombre: c.Nombre,
        Email: c.Email,
        Telefono: c.Telefono,
        Cargo: c.Cargo,
        Activo: c.Activo,
        CreatedAt: c.CreatedAt,
        UpdatedAt: c.UpdatedAt,
        CreatedBy: c.CreatedBy,
        UpdatedBy: c.UpdatedBy);
}
