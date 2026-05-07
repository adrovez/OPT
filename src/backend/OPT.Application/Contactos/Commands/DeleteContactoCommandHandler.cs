using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Contactos.Commands;

public class DeleteContactoCommandHandler(IContactoRepository contactoRepository)
    : IRequestHandler<DeleteContactoCommand, Unit>
{
    public async Task<Unit> Handle(
        DeleteContactoCommand request, CancellationToken cancellationToken)
    {
        await contactoRepository.SoftDeleteAsync(
            request.ContactoId, request.TenantId, request.DeletedBy, cancellationToken);

        return Unit.Value;
    }
}
