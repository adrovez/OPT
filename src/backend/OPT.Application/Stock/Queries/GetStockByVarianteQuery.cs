using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Stock.DTOs;

namespace OPT.Application.Stock.Queries;

public record GetStockByVarianteQuery(Guid TenantId, Guid SucursalId, Guid VarianteId) : IRequest<StockDto?>;

public class GetStockByVarianteQueryHandler(IStockRepository repository)
    : IRequestHandler<GetStockByVarianteQuery, StockDto?>
{
    public async Task<StockDto?> Handle(GetStockByVarianteQuery query, CancellationToken cancellationToken)
    {
        var stock = await repository.GetStockByVarianteAsync(query.TenantId, query.SucursalId, query.VarianteId, cancellationToken);
        return stock?.ToDto();
    }
}
