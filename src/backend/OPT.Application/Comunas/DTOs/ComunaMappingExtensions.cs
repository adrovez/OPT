using OPT.Domain.Entities;

namespace OPT.Application.Comunas.DTOs;

/// <summary>Extensiones para mapear entre entidad Comuna y ComunaDto.</summary>
public static class ComunaMappingExtensions
{
    public static ComunaDto ToDto(this Comuna c) => new(
        IdComuna: c.IdComuna,
        IdRegion: c.IdRegion,
        Nombre: c.Nombre,
        Codigo: c.Codigo);
}
