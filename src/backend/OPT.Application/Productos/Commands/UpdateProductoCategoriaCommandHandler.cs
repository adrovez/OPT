using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Productos.Commands;

public class UpdateProductoCategoriaCommandHandler(IProductoCategoriaRepository repository)
    : IRequestHandler<UpdateProductoCategoriaCommand>
{
    public async Task Handle(
        UpdateProductoCategoriaCommand request, CancellationToken cancellationToken)
    {
        var categoria = await repository.GetByIdAsync(request.CategoriaId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Categoría {request.CategoriaId} no encontrada.");

        categoria.Nombre = request.Nombre.Trim();
        categoria.UpdatedAt = DateTime.UtcNow;
        categoria.UpdatedBy = request.UpdatedBy;

        await repository.UpdateAsync(categoria, cancellationToken);
    }
}
