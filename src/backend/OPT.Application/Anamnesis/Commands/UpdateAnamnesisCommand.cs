using MediatR;

namespace OPT.Application.Anamnesis.Commands;

/// <summary>Comando para actualizar los antecedentes de una anamnesis existente.</summary>
public record UpdateAnamnesisCommand(
    Guid AnamnesisId,
    Guid TenantId,
    bool Hipertension,
    bool Diabetes,
    bool Alergias,
    bool UsaLentes,
    string? Observacion,
    string UpdatedBy) : IRequest;
