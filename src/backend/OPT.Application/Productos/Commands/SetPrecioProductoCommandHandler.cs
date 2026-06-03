using MediatR;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Application.Productos.Commands;

public class SetPrecioProductoCommandHandler(
    IProductoRepository productoRepo,
    IPrecioProductoRepository precioRepo)
    : IRequestHandler<SetPrecioProductoCommand>
{
    public async Task Handle(
        SetPrecioProductoCommand request, CancellationToken cancellationToken)
    {
        _ = await productoRepo.GetByIdAsync(request.ProductoId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Producto {request.ProductoId} no encontrado.");

        await precioRepo.SetPrecioAsync(
            request.TenantId,
            request.ProductoId,
            request.PrecioCosto,
            request.PrecioVenta,
            request.CreatedBy,
            cancellationToken);
    }
}
