using MediatR;

namespace OPT.Application.Transferencia.Commands;

public record CambiarEstadoTransferenciaCommand(
    Guid TenantId,
    Guid TransferenciaId,
    string Estado,
    Guid UsuarioId,
    string UpdatedBy) : IRequest;
