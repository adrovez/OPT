using MediatR;
using OPT.Application.Common;
using OPT.Application.Clientes.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Clientes.Queries;

public class GetClientesQueryHandler(IClienteRepository clienteRepository)
    : IRequestHandler<GetClientesQuery, PagedResult<ClienteDto>>
{
    public async Task<PagedResult<ClienteDto>> Handle(
        GetClientesQuery request, CancellationToken cancellationToken)
    {
        var paged = await clienteRepository.GetPagedAsync(
            request.TenantId,
            request.TipoCliente,
            request.Busqueda,
            request.Page,
            request.PageSize,
            cancellationToken);

        var dtos = paged.Items.Select(c => c.ToDto()).ToList();

        return new PagedResult<ClienteDto>
        {
            Items = dtos,
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize
        };
    }
}
