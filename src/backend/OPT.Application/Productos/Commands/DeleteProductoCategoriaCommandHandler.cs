using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Productos.Commands;

public class DeleteProductoCategoriaCommandHandler(IProductoCategoriaRepository repository)
    : IRequestHandler<DeleteProductoCategoriaCommand>
{
    public async Task Handle(
        DeleteProductoCategoriaCommand request, CancellationToken cancellationToken)
        => await repository.SoftDeleteAsync(
            request.CategoriaId, request.TenantId, request.DeletedBy, cancellationToken);
}
