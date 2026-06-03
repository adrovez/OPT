using MediatR;

namespace OPT.Application.DocumentoEntrada.Commands;

public record CambiarEstadoDocumentoEntradaCommand(
    Guid TenantId,
    Guid DocumentoId,
    string Estado,
    Guid UsuarioId,
    string UpdatedBy) : IRequest;
