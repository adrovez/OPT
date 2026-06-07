using MediatR;
using OPT.Application.Interfaces;
using OTEntity = OPT.Domain.Entities.OrdenTrabajo;

namespace OPT.Application.OrdenTrabajo.Commands;

public record RegistrarPagoOTCommand(
    Guid OTId,
    Guid TenantId,
    int FormaPagoId,
    decimal Monto,
    DateOnly FechaPago,
    string? Observacion,
    string CreatedBy) : IRequest<Guid>;

public class RegistrarPagoOTCommandHandler(IOrdenTrabajoRepository repository)
    : IRequestHandler<RegistrarPagoOTCommand, Guid>
{
    public async Task<Guid> Handle(RegistrarPagoOTCommand cmd, CancellationToken ct)
        => await repository.RegistrarPagoAsync(
            cmd.OTId, cmd.TenantId, cmd.FormaPagoId, cmd.Monto,
            cmd.FechaPago, cmd.Observacion, cmd.CreatedBy, ct);
}
