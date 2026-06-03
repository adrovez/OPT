using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.DocumentoEntrada.Commands;

public class CambiarEstadoDocumentoEntradaCommandHandler(IDocumentoEntradaRepository repository)
    : IRequestHandler<CambiarEstadoDocumentoEntradaCommand>
{
    private static readonly HashSet<string> EstadosValidos = ["Confirmado", "Anulado"];

    public async Task Handle(
        CambiarEstadoDocumentoEntradaCommand request, CancellationToken cancellationToken)
    {
        if (!EstadosValidos.Contains(request.Estado))
            throw new InvalidOperationException(
                $"Estado '{request.Estado}' no válido. Use 'Confirmado' o 'Anulado'.");

        if (request.Estado == "Confirmado")
            await repository.ConfirmarAsync(
                request.TenantId, request.DocumentoId,
                request.UsuarioId, request.UpdatedBy, cancellationToken);
        else
            await repository.AnularAsync(
                request.TenantId, request.DocumentoId,
                request.UsuarioId, request.UpdatedBy, cancellationToken);
    }
}
