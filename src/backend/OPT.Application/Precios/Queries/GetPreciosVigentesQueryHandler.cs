using MediatR;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Application.Precios.DTOs;

namespace OPT.Application.Precios.Queries;

public class GetPreciosVigentesQueryHandler(IPrecioProductoRepository repo)
    : IRequestHandler<GetPreciosVigentesQuery, PagedResult<PrecioProductoDto>>
{
    public Task<PagedResult<PrecioProductoDto>> Handle(
        GetPreciosVigentesQuery request, CancellationToken cancellationToken)
        => repo.GetVigentesPagedAsync(
            request.TenantId,
            request.Search,
            request.CategoriaId,
            request.Page,
            request.PageSize,
            cancellationToken);
}
