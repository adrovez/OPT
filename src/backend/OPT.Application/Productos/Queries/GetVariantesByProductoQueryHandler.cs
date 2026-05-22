using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Productos.DTOs;

namespace OPT.Application.Productos.Queries;

public class GetVariantesByProductoQueryHandler(IProductoVarianteRepository repository)
    : IRequestHandler<GetVariantesByProductoQuery, IReadOnlyList<ProductoVarianteDto>>
{
    public async Task<IReadOnlyList<ProductoVarianteDto>> Handle(
        GetVariantesByProductoQuery request, CancellationToken cancellationToken)
    {
        var variantes = await repository.GetByProductoAsync(request.ProductoId, request.TenantId, cancellationToken);
        return variantes.Select(v => v.ToDto()).ToList();
    }
}
