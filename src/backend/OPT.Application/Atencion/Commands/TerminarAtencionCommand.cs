using MediatR;

namespace OPT.Application.Atencion.Commands;

public record TerminarAtencionCommand(
    Guid AtencionId,
    Guid TenantId,
    string UpdatedBy) : IRequest;
