using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Anamnesis.Commands;

public class DeleteAnamnesisCommandHandler(IAnamnesisRepository repository)
    : IRequestHandler<DeleteAnamnesisCommand>
{
    public async Task Handle(
        DeleteAnamnesisCommand request, CancellationToken cancellationToken)
    {
        var existe = await repository.GetByIdAsync(
            request.AnamnesisId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException(
                $"Anamnesis {request.AnamnesisId} no encontrada.");

        await repository.SoftDeleteAsync(
            request.AnamnesisId, request.TenantId, request.DeletedBy, cancellationToken);
    }
}
