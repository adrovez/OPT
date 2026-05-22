using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Productos.DTOs;

namespace OPT.Application.Productos.Queries;

public class GetProductoByIdQueryHandler(IProductoRepository repository)
    : IRequestHandler<GetProductoByIdQuery, ProductoDto?>
{
    public async Task<ProductoDto?> Handle(
        GetProductoByIdQuery request, CancellationToken cancellationToken)
    {
        var producto = await repository.GetByIdAsync(request.ProductoId, request.TenantId, cancellationToken);
        return producto?.ToDto();
    }
}
