namespace OPT.Application.Comunas.DTOs;

/// <summary>DTO de respuesta para Comuna.</summary>
public record ComunaDto(
    int IdComuna,
    int IdRegion,
    string Nombre,
    string? Codigo);
