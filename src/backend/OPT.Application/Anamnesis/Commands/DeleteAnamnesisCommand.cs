using MediatR;

namespace OPT.Application.Anamnesis.Commands;

/// <summary>Elimina lógicamente una anamnesis (IsDeleted = true).</summary>
public record DeleteAnamnesisCommand(Guid AnamnesisId, Guid TenantId, string DeletedBy) : IRequest;
