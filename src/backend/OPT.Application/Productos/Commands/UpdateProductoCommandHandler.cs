using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Productos.Commands;

public class UpdateProductoCommandHandler(IProductoRepository repository)
    : IRequestHandler<UpdateProductoCommand>
{
    public async Task Handle(
        UpdateProductoCommand request, CancellationToken cancellationToken)
    {
        var producto = await repository.GetByIdAsync(
            request.ProductoId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Producto {request.ProductoId} no encontrado.");

        var existe = await repository.ExisteCodigoInternoAsync(
            request.CodigoInterno, request.TenantId, request.ProductoId, cancellationToken);
        if (existe)
            throw new InvalidOperationException(
                $"Ya existe un producto con el código interno '{request.CodigoInterno}'.");

        producto.CodigoInterno   = request.CodigoInterno.Trim();
        producto.Nombre          = request.Nombre.Trim();
        producto.Descripcion     = request.Descripcion?.Trim();
        producto.Tipo            = request.Tipo;
        producto.UnidadMedida    = request.UnidadMedida?.Trim();
        producto.CategoriaId     = request.CategoriaId;
        producto.ProductoPadreId = request.ProductoPadreId;
        producto.IsActivo        = request.IsActivo;
        producto.UpdatedAt       = DateTime.UtcNow;
        producto.UpdatedBy       = request.UpdatedBy;

        await repository.UpdateAsync(producto, cancellationToken);
    }
}
