using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Clientes.Commands;

public class DeleteClienteCommandHandler(IClienteRepository clienteRepository)
    : IRequestHandler<DeleteClienteCommand>
{
    public async Task Handle(DeleteClienteCommand request, CancellationToken cancellationToken)
    {
        await clienteRepository.SoftDeleteAsync(
            request.ClienteId, request.TenantId, request.DeletedBy, cancellationToken);
    }
}
