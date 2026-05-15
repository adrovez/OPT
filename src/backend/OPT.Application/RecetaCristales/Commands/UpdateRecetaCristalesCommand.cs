using MediatR;

namespace OPT.Application.RecetaCristales.Commands;

/// <summary>Comando para actualizar los datos de una receta de cristales existente.</summary>
public record UpdateRecetaCristalesCommand(
    Guid RecetaCristalesId,
    Guid TenantId,

    string? LejosODEsferico,
    string? LejosODCilindro,
    string? LejosODEje,
    string? LejosODObservacion,

    string? LejosOIEsferico,
    string? LejosOICilindro,
    string? LejosOIEje,
    string? LejosOIObservacion,

    string? LejosDPEsferico,
    string? LejosDPObservacion,

    string? CercaODEsferico,
    string? CercaODCilindro,
    string? CercaODEje,
    string? CercaODObservacion,

    string? CercaOIEsferico,
    string? CercaOICilindro,
    string? CercaOIEje,
    string? CercaOIObservacion,

    string? CercaDPEsferico,
    string? CercaDPObservacion,

    string? LejosADDEsfera,

    bool CheckLejos,
    bool CheckCerca,
    bool CheckCristalesLaboratorio,
    bool CheckUrgente,

    DateTime FechaIngreso,
    string UpdatedBy) : IRequest;
