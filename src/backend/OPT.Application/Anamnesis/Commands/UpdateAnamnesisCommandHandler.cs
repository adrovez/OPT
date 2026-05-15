using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Anamnesis.Commands;

public class UpdateAnamnesisCommandHandler(IAnamnesisRepository repository)
    : IRequestHandler<UpdateAnamnesisCommand>
{
    public async Task Handle(
        UpdateAnamnesisCommand request, CancellationToken cancellationToken)
    {
        var anamnesis = await repository.GetByIdAsync(
            request.AnamnesisId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException(
                $"Anamnesis {request.AnamnesisId} no encontrada.");

        anamnesis.Hipertension = request.Hipertension;
        anamnesis.Diabetes = request.Diabetes;
        anamnesis.Alergias = request.Alergias;
        anamnesis.UsaLentes = request.UsaLentes;
        anamnesis.Observacion = request.Observacion?.Trim();
        anamnesis.UpdatedAt = DateTime.UtcNow;
        anamnesis.UpdatedBy = request.UpdatedBy;

        await repository.UpdateAsync(anamnesis, cancellationToken);
    }
}
