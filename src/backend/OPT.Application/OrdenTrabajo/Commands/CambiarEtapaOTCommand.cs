using MediatR;
using OPT.Application.Interfaces;
using OTEntity = OPT.Domain.Entities.OrdenTrabajo;

namespace OPT.Application.OrdenTrabajo.Commands;

public record CambiarEtapaOTCommand(
    Guid OTId,
    Guid TenantId,
    string NuevaEtapa,
    string? Observacion,
    string Responsable) : IRequest;

public class CambiarEtapaOTCommandHandler(IOrdenTrabajoRepository repository)
    : IRequestHandler<CambiarEtapaOTCommand>
{
    public async Task Handle(CambiarEtapaOTCommand cmd, CancellationToken ct)
        => await repository.CambiarEtapaAsync(
            cmd.OTId, cmd.TenantId, cmd.NuevaEtapa, cmd.Responsable, cmd.Observacion, ct);
}
