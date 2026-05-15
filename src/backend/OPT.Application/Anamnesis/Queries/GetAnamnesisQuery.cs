using MediatR;
using OPT.Application.Anamnesis.DTOs;

namespace OPT.Application.Anamnesis.Queries;

/// <summary>Obtiene el detalle de una anamnesis por ID (validando TenantId).</summary>
public record GetAnamnesisQuery(Guid AnamnesisId, Guid TenantId) : IRequest<AnamnesisDto?>;
