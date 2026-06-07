using MediatR;
using OPT.Application.Interfaces;
using OTEntity = OPT.Domain.Entities.OrdenTrabajo;

namespace OPT.Application.OrdenTrabajo.Commands;

public record EditarOrdenTrabajoCommand(
    Guid OTId,
    Guid TenantId,
    string NumeroOT,
    Guid ClienteId,
    string TipoFacturacion,
    Guid? EmpresaClienteId,
    string? Beneficiario,
    Guid? RecetaCristalesId,
    DateOnly FechaEntrega,
    TimeOnly? HoraEntrega,
    decimal Descuento,
    int NumeroCuotas,
    DateOnly? FechaInicioCuotas,
    string? Observacion,
    IReadOnlyList<OTLineaInput> Lineas,
    IReadOnlyList<OTAbonoInput> Abonos,
    string UpdatedBy) : IRequest;

public class EditarOrdenTrabajoCommandHandler(IOrdenTrabajoRepository repository)
    : IRequestHandler<EditarOrdenTrabajoCommand>
{
    public async Task Handle(EditarOrdenTrabajoCommand cmd, CancellationToken ct)
        => await repository.ActualizarAsync(
            cmd.OTId, cmd.TenantId, cmd.NumeroOT, cmd.ClienteId,
            cmd.TipoFacturacion, cmd.EmpresaClienteId, cmd.Beneficiario,
            cmd.RecetaCristalesId,
            cmd.FechaEntrega, cmd.HoraEntrega,
            cmd.Descuento, cmd.NumeroCuotas, cmd.FechaInicioCuotas,
            cmd.Observacion, cmd.Lineas, cmd.Abonos, cmd.UpdatedBy, ct);
}
