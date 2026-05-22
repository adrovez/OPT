using MediatR;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Application.Productos.Commands;

public class CreateProductoVarianteCommandHandler(
    IProductoVarianteRepository varianteRepository,
    IProductoRepository productoRepository)
    : IRequestHandler<CreateProductoVarianteCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateProductoVarianteCommand request, CancellationToken cancellationToken)
    {
        var producto = await productoRepository.GetByIdAsync(request.ProductoId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Producto {request.ProductoId} no encontrado.");

        if (producto.TipoProducto == "Servicio")
            throw new InvalidOperationException("Los servicios no admiten variantes.");

        if (request.CodigoBarras is not null)
        {
            var existe = await varianteRepository.ExisteCodigoBorrasAsync(
                request.CodigoBarras, request.TenantId, cancellationToken: cancellationToken);
            if (existe)
                throw new InvalidOperationException(
                    $"Ya existe una variante con el código de barras '{request.CodigoBarras}'.");
        }

        var variante = new ProductoVariante
        {
            VarianteId = Guid.NewGuid(),
            ProductoId = request.ProductoId,
            TenantId = request.TenantId,
            Nombre = request.Nombre.Trim(),
            CodigoBarras = request.CodigoBarras?.Trim(),
            Activo = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.CreatedBy
        };

        var created = await varianteRepository.AddAsync(variante, cancellationToken);
        return created.VarianteId;
    }
}
