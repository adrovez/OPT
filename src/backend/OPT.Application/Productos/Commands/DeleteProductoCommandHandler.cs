using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Productos.Commands;

public class DeleteProductoCommandHandler(IProductoRepository repository)
    : IRequestHandler<DeleteProductoCommand>
{
    public async Task Handle(
        DeleteProductoCommand request, CancellationToken cancellationToken)
        => await repository.SoftDeleteAsync(
            request.ProductoId, request.TenantId, request.DeletedBy, cancellationToken);
}
