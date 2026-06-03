using MediatR;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Application.Productos.DTOs;

namespace OPT.Application.Productos.Queries;

public class GetProductosQueryHandler(IProductoRepository repository)
    : IRequestHandler<GetProductosQuery, PagedResult<ProductoDto>>
{
    public async Task<PagedResult<ProductoDto>> Handle(
        GetProductosQuery request, CancellationToken cancellationToken)
    {
        var paged = await repository.GetPagedAsync(
            request.TenantId,
            request.Tipo,
            request.CategoriaId,
            request.SoloRaices,
            request.PadreId,
            request.Busqueda,
            request.Page,
            request.PageSize,
            cancellationToken);

        return new PagedResult<ProductoDto>
        {
            Items      = paged.Items.Select(p => p.ToDto()).ToList(),
            TotalCount = paged.TotalCount,
            Page       = paged.Page,
            PageSize   = paged.PageSize
        };
    }
}
