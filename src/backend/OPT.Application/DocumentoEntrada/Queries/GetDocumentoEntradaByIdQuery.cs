using MediatR;
using OPT.Application.DocumentoEntrada.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.DocumentoEntrada.Queries;

public record GetDocumentoEntradaByIdQuery(
    Guid TenantId, Guid DocumentoId) : IRequest<DocumentoEntradaDto?>;

public class GetDocumentoEntradaByIdQueryHandler(IDocumentoEntradaRepository repository)
    : IRequestHandler<GetDocumentoEntradaByIdQuery, DocumentoEntradaDto?>
{
    public async Task<DocumentoEntradaDto?> Handle(
        GetDocumentoEntradaByIdQuery request, CancellationToken cancellationToken)
    {
        var doc = await repository.GetByIdAsync(
            request.TenantId, request.DocumentoId, cancellationToken);
        return doc?.ToDto();
    }
}
