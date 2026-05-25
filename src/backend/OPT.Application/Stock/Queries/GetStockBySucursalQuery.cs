using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Stock.DTOs;

namespace OPT.Application.Stock.Queries;

public record GetStockBySucursalQuery(Guid TenantId, Guid SucursalId) : IRequest<IReadOnlyList<StockDto>>;

public class GetStockBySucursalQueryHandler(IStockRepository repository)
    : IRequestHandler<GetStockBySucursalQuery, IReadOnlyList<StockDto>>
{
    public async Task<IReadOnlyList<StockDto>> Handle(GetStockBySucursalQuery query, CancellationToken cancellationToken)
    {
        var items = await repository.GetStockBySucursalAsync(query.TenantId, query.SucursalId, cancellationToken);
        return items.Select(s => s.ToDto()).ToList();
    }
}
