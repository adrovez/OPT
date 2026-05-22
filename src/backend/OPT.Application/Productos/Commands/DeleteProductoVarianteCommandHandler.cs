using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Productos.Commands;

public class DeleteProductoVarianteCommandHandler(IProductoVarianteRepository repository)
    : IRequestHandler<DeleteProductoVarianteCommand>
{
    public async Task Handle(
        DeleteProductoVarianteCommand request, CancellationToken cancellationToken)
        => await repository.SoftDeleteAsync(
            request.VarianteId, request.TenantId, request.DeletedBy, cancellationToken);
}
