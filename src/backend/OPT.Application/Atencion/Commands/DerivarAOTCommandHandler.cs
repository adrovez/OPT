using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Atencion.Commands;

public class DerivarAOTCommandHandler(IAtencionRepository repository)
    : IRequestHandler<DerivarAOTCommand>
{
    public async Task Handle(DerivarAOTCommand request, CancellationToken cancellationToken)
    {
        var atencion = await repository.GetByIdAsync(
            request.AtencionId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Atención {request.AtencionId} no encontrada.");

        if (atencion.Estado != "Abierta")
            throw new InvalidOperationException(
                $"Solo se puede derivar a OT una Atención en estado 'Abierta'. Estado actual: '{atencion.Estado}'.");

        atencion.Estado    = "DerivoOT";
        atencion.UpdatedAt = DateTime.UtcNow;
        atencion.UpdatedBy = request.UpdatedBy;

        await repository.UpdateAsync(atencion, cancellationToken);
    }
}
