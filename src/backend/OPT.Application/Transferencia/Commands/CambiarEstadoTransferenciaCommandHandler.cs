using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Transferencia.Commands;

public class CambiarEstadoTransferenciaCommandHandler(ITransferenciaRepository repository)
    : IRequestHandler<CambiarEstadoTransferenciaCommand>
{
    private static readonly HashSet<string> EstadosValidos = ["Confirmada", "Anulada"];

    public async Task Handle(
        CambiarEstadoTransferenciaCommand request, CancellationToken cancellationToken)
    {
        if (!EstadosValidos.Contains(request.Estado))
            throw new InvalidOperationException(
                $"Estado '{request.Estado}' no válido. Use 'Confirmada' o 'Anulada'.");

        if (request.Estado == "Confirmada")
            await repository.ConfirmarAsync(
                request.TenantId, request.TransferenciaId,
                request.UsuarioId, request.UpdatedBy, cancellationToken);
        else
            await repository.AnularAsync(
                request.TenantId, request.TransferenciaId,
                request.UsuarioId, request.UpdatedBy, cancellationToken);
    }
}
