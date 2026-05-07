using OPT.Application.Contactos.DTOs;
using OPT.Domain.Entities;

namespace OPT.Application.Clientes.DTOs;

/// <summary>Extensiones para mapear entre entidad Cliente y ClienteDto.</summary>
public static class ClienteMappingExtensions
{
    public static ClienteDto ToDto(this Cliente c) => new(
        ClienteId: c.ClienteId,
        TenantId: c.TenantId,
        TipoCliente: c.TipoCliente,
        NumeroDocumento: c.NumeroDocumento,
        Nombre: c.Nombre,
        Direccion: c.Direccion,
        IdComuna: c.IdComuna,
        Celular: c.Celular,
        Mail: c.Mail,
        FechaIngreso: c.FechaIngreso,
        FechaNacimiento: c.FechaNacimiento,
        TipoPrevision: c.TipoPrevision,
        Giro: c.Giro,
        Contactos: c.Contactos.Select(ct => ct.ToDto()).ToList(),
        CreatedAt: c.CreatedAt,
        UpdatedAt: c.UpdatedAt,
        CreatedBy: c.CreatedBy,
        UpdatedBy: c.UpdatedBy);
}
