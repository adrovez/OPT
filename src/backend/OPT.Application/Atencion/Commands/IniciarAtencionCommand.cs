using MediatR;

namespace OPT.Application.Atencion.Commands;

public record IniciarAtencionCommand(
    Guid TenantId,
    Guid SucursalId,
    string CreatedBy,

    // Atención
    Guid? AgendaId,
    Guid ClienteId,
    Guid UsuarioAtencionId,
    DateTime FechaHoraAtencion,
    string Motivo,
    string? Observaciones,

    // Anamnesis
    bool Hipertension,
    bool Diabetes,
    bool Alergias,
    bool UsaLentes,
    string? AnamnesisObservacion,

    // RecetaCristales — Lejos OD
    string? LejosODEsferico,
    string? LejosODCilindro,
    string? LejosODEje,
    string? LejosODObservacion,

    // RecetaCristales — Lejos OI
    string? LejosOIEsferico,
    string? LejosOICilindro,
    string? LejosOIEje,
    string? LejosOIObservacion,

    // RecetaCristales — Lejos DP
    string? LejosDPEsferico,
    string? LejosDPObservacion,

    // RecetaCristales — Cerca OD
    string? CercaODEsferico,
    string? CercaODCilindro,
    string? CercaODEje,
    string? CercaODObservacion,

    // RecetaCristales — Cerca OI
    string? CercaOIEsferico,
    string? CercaOICilindro,
    string? CercaOIEje,
    string? CercaOIObservacion,

    // RecetaCristales — Cerca DP
    string? CercaDPEsferico,
    string? CercaDPObservacion,

    // RecetaCristales — ADD
    string? LejosADDEsfera,

    // RecetaCristales — Flags
    bool CheckLejos,
    bool CheckCerca,
    bool CheckCristalesLaboratorio,
    bool CheckUrgente
) : IRequest<IniciarAtencionResult>;

public record IniciarAtencionResult(
    Guid AtencionId,
    Guid AnamnesisId,
    Guid RecetaCristalesId);
