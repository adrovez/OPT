using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.DocumentoStock.Commands;

public record AnularDocumentoCommand(
    Guid TenantId,
    Guid DocumentoId,
    Guid UsuarioId,
    string UpdatedBy
) : IRequest;

public class AnularDocumentoCommandHandler(
    IDocumentoStockRepository repo) : IRequestHandler<AnularDocumentoCommand>
{
    public Task Handle(AnularDocumentoCommand cmd, CancellationToken ct) =>
        repo.AnularAsync(
            tenantId:    cmd.TenantId,
            documentoId: cmd.DocumentoId,
            usuarioId:   cmd.UsuarioId,
            updatedBy:   cmd.UpdatedBy,
            ct:          ct);
}
