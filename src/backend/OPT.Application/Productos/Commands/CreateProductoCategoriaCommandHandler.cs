using MediatR;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Application.Productos.Commands;

public class CreateProductoCategoriaCommandHandler(IProductoCategoriaRepository repository)
    : IRequestHandler<CreateProductoCategoriaCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateProductoCategoriaCommand request, CancellationToken cancellationToken)
    {
        var categoria = new ProductoCategoria
        {
            CategoriaId = Guid.NewGuid(),
            TenantId = request.TenantId,
            Nombre = request.Nombre.Trim(),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.CreatedBy
        };

        var created = await repository.AddAsync(categoria, cancellationToken);
        return created.CategoriaId;
    }
}
