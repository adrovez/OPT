using MediatR;
using OPT.Application.Interfaces;
using ProductoEntity = OPT.Domain.Entities.Producto;

namespace OPT.Application.Productos.Commands;

public class CreateProductoCommandHandler(IProductoRepository repository)
    : IRequestHandler<CreateProductoCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateProductoCommand request, CancellationToken cancellationToken)
    {
        if (request.CodigoInterno is not null)
        {
            var existe = await repository.ExisteCodigoInternoAsync(
                request.CodigoInterno, request.TenantId, cancellationToken: cancellationToken);
            if (existe)
                throw new InvalidOperationException(
                    $"Ya existe un producto con el código interno '{request.CodigoInterno}'.");
        }

        var producto = new ProductoEntity
        {
            ProductoId = Guid.NewGuid(),
            TenantId = request.TenantId,
            CategoriaId = request.CategoriaId,
            Nombre = request.Nombre.Trim(),
            Descripcion = request.Descripcion?.Trim(),
            TipoProducto = request.TipoProducto,
            CodigoInterno = request.CodigoInterno?.Trim(),
            Activo = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.CreatedBy
        };

        var created = await repository.AddAsync(producto, cancellationToken);
        return created.ProductoId;
    }
}
