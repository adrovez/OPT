using MediatR;

namespace OPT.Application.Atencion.Commands;

public record DerivarAOTCommand(
    Guid AtencionId,
    Guid TenantId,
    string UpdatedBy) : IRequest;
