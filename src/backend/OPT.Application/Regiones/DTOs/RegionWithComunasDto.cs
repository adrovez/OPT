namespace OPT.Application.Regiones.DTOs;

/// <summary>DTO de respuesta para Región con sus Comunas anidadas.</summary>
public record RegionWithComunasDto(
    int IdRegion,
    string Nombre,
    string? Codigo,
    IReadOnlyList<ComunaItemDto> Comunas);

/// <summary>DTO compacto de Comuna usado dentro de RegionWithComunasDto.</summary>
public record ComunaItemDto(
    int IdComuna,
    string Nombre);
