using OPT.Domain.Entities;

namespace OPT.Application.Regiones.DTOs;

/// <summary>Extensiones para mapear entre entidad Region y RegionDto.</summary>
public static class RegionMappingExtensions
{
    public static RegionDto ToDto(this Region r) => new(
        IdRegion: r.IdRegion,
        Nombre: r.Nombre,
        Codigo: r.Codigo);
}
