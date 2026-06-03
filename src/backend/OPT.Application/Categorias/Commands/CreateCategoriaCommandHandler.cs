using MediatR;
using OPT.Application.Interfaces;
using CategoriaEntity = OPT.Domain.Entities.Categoria;

namespace OPT.Application.Categorias.Commands;

public class CreateCategoriaCommandHandler(ICategoriaRepository repository)
    : IRequestHandler<CreateCategoriaCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateCategoriaCommand request, CancellationToken cancellationToken)
    {
        var categoria = new CategoriaEntity
        {
            TenantId    = request.TenantId,
            Nombre      = request.Nombre.Trim(),
            Descripcion = request.Descripcion?.Trim(),
            IsActivo    = true,
            CreatedAt   = DateTime.UtcNow,
            CreatedBy   = request.CreatedBy
        };

        var created = await repository.AddAsync(categoria, cancellationToken);
        return created.CategoriaId;
    }
}
