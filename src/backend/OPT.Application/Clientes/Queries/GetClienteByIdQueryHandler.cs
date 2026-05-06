using MediatR;
using OPT.Application.Clientes.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Clientes.Queries;

public class GetClienteByIdQueryHandler(IClienteRepository clienteRepository)
    : IRequestHandler<GetClienteByIdQuery, ClienteDto?>
{
    public async Task<ClienteDto?> Handle(
        GetClienteByIdQuery request, CancellationToken cancellationToken)
    {
        var cliente = await clienteRepository.GetByIdAsync(
            request.ClienteId, request.TenantId, cancellationToken);

        return cliente?.ToDto();
    }
}
