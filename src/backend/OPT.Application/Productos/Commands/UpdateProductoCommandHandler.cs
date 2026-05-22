using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Productos.Commands;

public class UpdateProductoCommandHandler(IProductoRepository repository)
    : IRequestHandler<UpdateProductoCommand>
{
    public async Task Handle(
        UpdateProductoCommand request, CancellationToken cancellationToken)
    {
        var producto = await repository.GetByIdAsync(request.ProductoId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Producto {request.ProductoId} no encontrado.");

        if (request.CodigoInterno is not null)
        {
            var existe = await repository.ExisteCodigoInternoAsync(
                request.CodigoInterno, request.TenantId, request.ProductoId, cancellationToken);
            if (existe)
                throw new InvalidOperationException(
                    $"Ya existe un producto con el código interno '{request.CodigoInterno}'.");
        }

        producto.CategoriaId = request.CategoriaId;
        producto.Nombre = request.Nombre.Trim();
        producto.Descripcion = request.Descripcion?.Trim();
        producto.TipoProducto = request.TipoProducto;
        producto.CodigoInterno = request.CodigoInterno?.Trim();
        producto.Activo = request.Activo;
        producto.UpdatedAt = DateTime.UtcNow;
        producto.UpdatedBy = request.UpdatedBy;

        await repository.UpdateAsync(producto, cancellationToken);
    }
}
