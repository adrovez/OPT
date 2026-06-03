using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Stock.Commands;

public class RegistrarMovimientoCommandHandler(IStockRepository repository)
    : IRequestHandler<RegistrarMovimientoCommand, Guid>
{
    public async Task<Guid> Handle(
        RegistrarMovimientoCommand request, CancellationToken cancellationToken)
        => await repository.RegistrarMovimientoDirectoAsync(
            request.TenantId, request.SucursalId, request.ProductoId, request.UsuarioId,
            request.TipoMovimiento, request.Cantidad,
            request.Referencia, request.Observacion,
            request.CreatedBy, cancellationToken);
}
