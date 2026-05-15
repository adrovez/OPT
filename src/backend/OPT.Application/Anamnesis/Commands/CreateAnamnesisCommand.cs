using MediatR;

namespace OPT.Application.Anamnesis.Commands;

/// <summary>Comando para registrar una nueva anamnesis de un cliente.</summary>
public record CreateAnamnesisCommand(
    Guid TenantId,
    Guid ClienteId,
    bool Hipertension,
    bool Diabetes,
    bool Alergias,
    bool UsaLentes,
    string? Observacion,
    string CreatedBy) : IRequest<Guid>;
