using MediatR;
using OPT.Application.Anamnesis.DTOs;

namespace OPT.Application.Anamnesis.Queries;

/// <summary>Retorna todas las anamnesis activas de un cliente dentro del tenant.</summary>
public record GetAnamnesisByClienteQuery(Guid ClienteId, Guid TenantId)
    : IRequest<IReadOnlyList<AnamnesisDto>>;
