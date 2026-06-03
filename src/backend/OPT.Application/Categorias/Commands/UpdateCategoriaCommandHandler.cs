using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Categorias.Commands;

public class UpdateCategoriaCommandHandler(ICategoriaRepository repository)
    : IRequestHandler<UpdateCategoriaCommand>
{
    public async Task Handle(
        UpdateCategoriaCommand request, CancellationToken cancellationToken)
    {
        var categoria = await repository.GetByIdAsync(
            request.CategoriaId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Categoría {request.CategoriaId} no encontrada.");

        categoria.Nombre      = request.Nombre.Trim();
        categoria.Descripcion = request.Descripcion?.Trim();
        categoria.IsActivo    = request.IsActivo;
        categoria.UpdatedAt   = DateTime.UtcNow;
        categoria.UpdatedBy   = request.UpdatedBy;

        await repository.UpdateAsync(categoria, cancellationToken);
    }
}
