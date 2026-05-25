using MediatR;
using OPT.Application.DocumentoStock.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.DocumentoStock.Queries;

public record GetDocumentoByIdQuery(Guid TenantId, Guid DocumentoId) : IRequest<DocumentoStockDto?>;

public class GetDocumentoByIdQueryHandler(
    IDocumentoStockRepository repo) : IRequestHandler<GetDocumentoByIdQuery, DocumentoStockDto?>
{
    public async Task<DocumentoStockDto?> Handle(GetDocumentoByIdQuery q, CancellationToken ct)
    {
        var doc = await repo.GetDocumentoByIdAsync(q.TenantId, q.DocumentoId, ct);
        return doc?.ToDto();
    }
}
