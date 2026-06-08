using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Atencion.Commands;

public class TerminarAtencionCommandHandler(IAtencionRepository repository)
    : IRequestHandler<TerminarAtencionCommand>
{
    public async Task Handle(TerminarAtencionCommand request, CancellationToken cancellationToken)
    {
        var atencion = await repository.GetByIdAsync(
            request.AtencionId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Atención {request.AtencionId} no encontrada.");

        if (atencion.Estado != "Abierta")
            throw new InvalidOperationException(
                $"Solo se puede terminar una Atención en estado 'Abierta'. Estado actual: '{atencion.Estado}'.");

        atencion.Estado    = "Terminada";
        atencion.UpdatedAt = DateTime.UtcNow;
        atencion.UpdatedBy = request.UpdatedBy;

        await repository.UpdateAsync(atencion, cancellationToken);
    }
}
