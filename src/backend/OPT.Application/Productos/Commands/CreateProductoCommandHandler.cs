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
        var existe = await repository.ExisteCodigoInternoAsync(
            request.CodigoInterno, request.TenantId, cancellationToken: cancellationToken);
        if (existe)
            throw new InvalidOperationException(
                $"Ya existe un producto con el código interno '{request.CodigoInterno}'.");

        var producto = new ProductoEntity
        {
            TenantId       = request.TenantId,
            CodigoInterno  = request.CodigoInterno.Trim(),
            Nombre         = request.Nombre.Trim(),
            Descripcion    = request.Descripcion?.Trim(),
            Tipo           = request.Tipo,
            UnidadMedida   = request.UnidadMedida?.Trim(),
            CategoriaId    = request.CategoriaId,
            ProductoPadreId = request.ProductoPadreId,
            IsActivo       = true,
            CreatedAt      = DateTime.UtcNow,
            CreatedBy      = request.CreatedBy
        };

        var created = await repository.AddAsync(producto, cancellationToken);
        return created.ProductoId;
    }
}
