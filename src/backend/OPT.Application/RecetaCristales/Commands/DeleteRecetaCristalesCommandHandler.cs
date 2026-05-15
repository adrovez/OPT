using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.RecetaCristales.Commands;

public class DeleteRecetaCristalesCommandHandler(IRecetaCristalesRepository repository)
    : IRequestHandler<DeleteRecetaCristalesCommand>
{
    public async Task Handle(
        DeleteRecetaCristalesCommand request, CancellationToken cancellationToken)
        => await repository.SoftDeleteAsync(
            request.RecetaCristalesId, request.TenantId, request.DeletedBy, cancellationToken);
}
