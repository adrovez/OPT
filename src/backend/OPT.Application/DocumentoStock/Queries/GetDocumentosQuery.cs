using MediatR;
using OPT.Application.Common;
using OPT.Application.DocumentoStock.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.DocumentoStock.Queries;

public record GetDocumentosQuery(
    Guid TenantId,
    Guid SucursalId,
    string? Tipo,
    string? Estado,
    DateOnly? Desde,
    DateOnly? Hasta,
    int Page     = 1,
    int PageSize = 50
) : IRequest<PagedResult<DocumentoStockDto>>;

public class GetDocumentosQueryHandler(
    IDocumentoStockRepository repo) : IRequestHandler<GetDocumentosQuery, PagedResult<DocumentoStockDto>>
{
    public async Task<PagedResult<DocumentoStockDto>> Handle(GetDocumentosQuery q, CancellationToken ct)
    {
        var items = await repo.GetDocumentosAsync(
            q.TenantId, q.SucursalId, q.Tipo, q.Estado, q.Desde, q.Hasta,
            q.Page, q.PageSize, ct);

        var total = await repo.GetDocumentosCountAsync(
            q.TenantId, q.SucursalId, q.Tipo, q.Estado, q.Desde, q.Hasta, ct);

        return new PagedResult<DocumentoStockDto>
        {
            Items      = items.Select(d => d.ToDto()).ToList(),
            TotalCount = total,
            Page       = q.Page,
            PageSize   = q.PageSize,
        };
    }
}
