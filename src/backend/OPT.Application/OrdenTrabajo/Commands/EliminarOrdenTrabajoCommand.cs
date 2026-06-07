using MediatR;
using OPT.Application.Interfaces;
using OTEntity = OPT.Domain.Entities.OrdenTrabajo;

namespace OPT.Application.OrdenTrabajo.Commands;

public record EliminarOrdenTrabajoCommand(
    Guid OTId,
    Guid TenantId,
    string DeletedBy) : IRequest;

public class EliminarOrdenTrabajoCommandHandler(IOrdenTrabajoRepository repository)
    : IRequestHandler<EliminarOrdenTrabajoCommand>
{
    public async Task Handle(EliminarOrdenTrabajoCommand cmd, CancellationToken ct)
        => await repository.SoftDeleteAsync(cmd.OTId, cmd.TenantId, cmd.DeletedBy, ct);
}
