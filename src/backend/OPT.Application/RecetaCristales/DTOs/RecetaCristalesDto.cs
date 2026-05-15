namespace OPT.Application.RecetaCristales.DTOs;

/// <summary>DTO de respuesta para listado y detalle de receta de cristales.</summary>
public record RecetaCristalesDto(
    Guid RecetaCristalesId,
    Guid TenantId,
    Guid ClienteId,

    // Lejos OD
    string? LejosODEsferico,
    string? LejosODCilindro,
    string? LejosODEje,
    string? LejosODObservacion,

    // Lejos OI
    string? LejosOIEsferico,
    string? LejosOICilindro,
    string? LejosOIEje,
    string? LejosOIObservacion,

    // Lejos DP
    string? LejosDPEsferico,
    string? LejosDPObservacion,

    // Cerca OD
    string? CercaODEsferico,
    string? CercaODCilindro,
    string? CercaODEje,
    string? CercaODObservacion,

    // Cerca OI
    string? CercaOIEsferico,
    string? CercaOICilindro,
    string? CercaOIEje,
    string? CercaOIObservacion,

    // Cerca DP
    string? CercaDPEsferico,
    string? CercaDPObservacion,

    // ADD
    string? LejosADDEsfera,

    // Flags
    bool CheckLejos,
    bool CheckCerca,
    bool CheckCristalesLaboratorio,
    bool CheckUrgente,

    DateTime FechaIngreso,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    string? CreatedBy,
    string? UpdatedBy);
