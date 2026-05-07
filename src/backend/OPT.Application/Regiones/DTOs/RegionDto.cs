namespace OPT.Application.Regiones.DTOs;

/// <summary>DTO de respuesta para Región.</summary>
public record RegionDto(
    int IdRegion,
    string Nombre,
    string? Codigo);
