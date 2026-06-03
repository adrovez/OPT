using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Precios.DTOs;

namespace OPT.Application.Precios.Queries;

public class GetHistorialPreciosQueryHandler(
    IProductoRepository productoRepo,
    IPrecioProductoRepository precioRepo)
    : IRequestHandler<GetHistorialPreciosQuery, IReadOnlyList<PrecioProductoDto>>
{
    public async Task<IReadOnlyList<PrecioProductoDto>> Handle(
        GetHistorialPreciosQuery request, CancellationToken cancellationToken)
    {
        _ = await productoRepo.GetByIdAsync(request.ProductoId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Producto {request.ProductoId} no encontrado.");

        return await precioRepo.GetHistorialAsync(
            request.TenantId, request.ProductoId, cancellationToken);
    }
}
