using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Productos.Commands;

public class UpdateProductoVarianteCommandHandler(IProductoVarianteRepository repository)
    : IRequestHandler<UpdateProductoVarianteCommand>
{
    public async Task Handle(
        UpdateProductoVarianteCommand request, CancellationToken cancellationToken)
    {
        var variante = await repository.GetByIdAsync(request.VarianteId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Variante {request.VarianteId} no encontrada.");

        if (variante.ProductoId != request.ProductoId)
            throw new KeyNotFoundException($"Variante {request.VarianteId} no pertenece al producto {request.ProductoId}.");

        if (request.CodigoBarras is not null)
        {
            var existe = await repository.ExisteCodigoBorrasAsync(
                request.CodigoBarras, request.TenantId, request.VarianteId, cancellationToken);
            if (existe)
                throw new InvalidOperationException(
                    $"Ya existe una variante con el código de barras '{request.CodigoBarras}'.");
        }

        variante.Nombre = request.Nombre.Trim();
        variante.CodigoBarras = request.CodigoBarras?.Trim();
        variante.Activo = request.Activo;
        variante.UpdatedAt = DateTime.UtcNow;
        variante.UpdatedBy = request.UpdatedBy;

        await repository.UpdateAsync(variante, cancellationToken);
    }
}
