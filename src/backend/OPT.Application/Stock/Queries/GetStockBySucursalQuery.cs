using MediatR;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Application.Stock.DTOs;

namespace OPT.Application.Stock.Queries;

public record GetStockBySucursalQuery(
    Guid TenantId,
    Guid SucursalId,
    int Page = 1,
    int PageSize = 50) : IRequest<PagedResult<StockDto>>;

public class GetStockBySucursalQueryHandler(IStockRepository repository)
    : IRequestHandler<GetStockBySucursalQuery, PagedResult<StockDto>>
{
    public async Task<PagedResult<StockDto>> Handle(
        GetStockBySucursalQuery query, CancellationToken cancellationToken)
    {
        var paged = await repository.GetStockBySucursalAsync(
            query.TenantId, query.SucursalId, query.Page, query.PageSize, cancellationToken);

        return new PagedResult<StockDto>
        {
            Items      = paged.Items.Select(s => s.ToDto()).ToList(),
            TotalCount = paged.TotalCount,
            Page       = paged.Page,
            PageSize   = paged.PageSize
        };
    }
}
