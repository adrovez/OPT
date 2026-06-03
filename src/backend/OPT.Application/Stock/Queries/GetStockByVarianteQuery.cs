using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Stock.DTOs;

namespace OPT.Application.Stock.Queries;

public record GetStockByProductoQuery(
    Guid TenantId,
    Guid SucursalId,
    Guid ProductoId) : IRequest<StockDto?>;

public class GetStockByProductoQueryHandler(IStockRepository repository)
    : IRequestHandler<GetStockByProductoQuery, StockDto?>
{
    public async Task<StockDto?> Handle(
        GetStockByProductoQuery query, CancellationToken cancellationToken)
    {
        var stock = await repository.GetStockByProductoAsync(
            query.TenantId, query.SucursalId, query.ProductoId, cancellationToken);
        return stock?.ToDto();
    }
}
