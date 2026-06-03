using MediatR;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Application.Transferencia.DTOs;

namespace OPT.Application.Transferencia.Queries;

public record GetTransferenciasQuery(
    Guid TenantId,
    Guid? SucursalId,
    string? Estado,
    int Page,
    int PageSize) : IRequest<PagedResult<TransferenciaDto>>;

public class GetTransferenciasQueryHandler(ITransferenciaRepository repository)
    : IRequestHandler<GetTransferenciasQuery, PagedResult<TransferenciaDto>>
{
    public async Task<PagedResult<TransferenciaDto>> Handle(
        GetTransferenciasQuery request, CancellationToken cancellationToken)
    {
        var paged = await repository.GetPagedAsync(
            request.TenantId, request.SucursalId, request.Estado,
            request.Page, request.PageSize, cancellationToken);

        return new PagedResult<TransferenciaDto>
        {
            Items      = paged.Items.Select(t => t.ToDto()).ToList(),
            TotalCount = paged.TotalCount,
            Page       = paged.Page,
            PageSize   = paged.PageSize
        };
    }
}
