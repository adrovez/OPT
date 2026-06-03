using MediatR;
using OPT.Application.Common;
using OPT.Application.DocumentoEntrada.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.DocumentoEntrada.Queries;

public record GetDocumentosEntradaQuery(
    Guid TenantId,
    Guid SucursalId,
    string? Estado,
    int Page,
    int PageSize) : IRequest<PagedResult<DocumentoEntradaDto>>;

public class GetDocumentosEntradaQueryHandler(IDocumentoEntradaRepository repository)
    : IRequestHandler<GetDocumentosEntradaQuery, PagedResult<DocumentoEntradaDto>>
{
    public async Task<PagedResult<DocumentoEntradaDto>> Handle(
        GetDocumentosEntradaQuery request, CancellationToken cancellationToken)
    {
        var paged = await repository.GetPagedAsync(
            request.TenantId, request.SucursalId, request.Estado,
            request.Page, request.PageSize, cancellationToken);

        return new PagedResult<DocumentoEntradaDto>
        {
            Items      = paged.Items.Select(d => d.ToDto()).ToList(),
            TotalCount = paged.TotalCount,
            Page       = paged.Page,
            PageSize   = paged.PageSize
        };
    }
}
