using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Categorias.Commands;

public class DeleteCategoriaCommandHandler(ICategoriaRepository repository)
    : IRequestHandler<DeleteCategoriaCommand>
{
    public async Task Handle(
        DeleteCategoriaCommand request, CancellationToken cancellationToken)
        => await repository.SoftDeleteAsync(
            request.CategoriaId, request.TenantId, request.DeletedBy, cancellationToken);
}
