using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Productos.DTOs;

namespace OPT.Application.Productos.Queries;

public class GetProductoByIdQueryHandler(
    IProductoRepository productoRepo,
    IPrecioProductoRepository precioRepo)
    : IRequestHandler<GetProductoByIdQuery, ProductoDto?>
{
    public async Task<ProductoDto?> Handle(
        GetProductoByIdQuery request, CancellationToken cancellationToken)
    {
        var producto = await productoRepo.GetByIdAsync(
            request.ProductoId, request.TenantId, cancellationToken);
        if (producto is null) return null;

        var precio = await precioRepo.GetVigenteAsync(
            request.TenantId, request.ProductoId, cancellationToken);

        return producto.ToDto(precio?.PrecioCosto, precio?.PrecioVenta);
    }
}
