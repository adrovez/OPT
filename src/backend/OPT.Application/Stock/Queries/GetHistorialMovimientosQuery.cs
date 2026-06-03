using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Stock.DTOs;

namespace OPT.Application.Stock.Queries;

public record GetHistorialMovimientosQuery(
    Guid TenantId,
    Guid SucursalId,
    DateTime? Desde,
    DateTime? Hasta,
    string? TipoMovimiento) : IRequest<IReadOnlyList<MovimientoStockDto>>;

public class GetHistorialMovimientosQueryHandler(IStockRepository repository)
    : IRequestHandler<GetHistorialMovimientosQuery, IReadOnlyList<MovimientoStockDto>>
{
    public async Task<IReadOnlyList<MovimientoStockDto>> Handle(
        GetHistorialMovimientosQuery query, CancellationToken cancellationToken)
    {
        var items = await repository.GetHistorialAsync(
            query.TenantId, query.SucursalId,
            query.Desde, query.Hasta, query.TipoMovimiento,
            cancellationToken);
        return items.Select(m => m.ToDto()).ToList();
    }
}
