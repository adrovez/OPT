using MediatR;

namespace OPT.Application.RecetaCristales.Commands;

/// <summary>Comando para registrar una nueva receta de cristales de un cliente.</summary>
public record CreateRecetaCristalesCommand(
    Guid TenantId,
    Guid ClienteId,

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
    string CreatedBy) : IRequest<Guid>;
