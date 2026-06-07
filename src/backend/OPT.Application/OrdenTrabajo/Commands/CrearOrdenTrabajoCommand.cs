using MediatR;
using OPT.Application.Interfaces;
using OTEntity = OPT.Domain.Entities.OrdenTrabajo;

namespace OPT.Application.OrdenTrabajo.Commands;

public record CrearOrdenTrabajoCommand(
    Guid TenantId,
    Guid SucursalId,
    string NumeroOT,
    Guid ClienteId,
    string TipoFacturacion,
    Guid? EmpresaClienteId,
    string? Beneficiario,
    Guid? AtencionId,
    Guid? RecetaCristalesId,
    DateOnly FechaEntrega,
    TimeOnly? HoraEntrega,
    decimal Descuento,
    int NumeroCuotas,
    DateOnly? FechaInicioCuotas,
    string? Observacion,
    IReadOnlyList<OTLineaInput> Lineas,
    IReadOnlyList<OTAbonoInput> Abonos,
    string CreatedBy) : IRequest<Guid>;

public class CrearOrdenTrabajoCommandHandler(IOrdenTrabajoRepository repository)
    : IRequestHandler<CrearOrdenTrabajoCommand, Guid>
{
    public async Task<Guid> Handle(CrearOrdenTrabajoCommand cmd, CancellationToken ct)
    {
        var existe = await repository.ExisteNumeroOTAsync(cmd.NumeroOT, cmd.TenantId, null, ct);
        if (existe)
            throw new InvalidOperationException($"Ya existe una Orden de Trabajo con el número '{cmd.NumeroOT}'.");

        return await repository.CrearAsync(
            cmd.TenantId, cmd.SucursalId, cmd.NumeroOT, cmd.ClienteId,
            cmd.TipoFacturacion, cmd.EmpresaClienteId, cmd.Beneficiario,
            cmd.AtencionId, cmd.RecetaCristalesId,
            cmd.FechaEntrega, cmd.HoraEntrega,
            cmd.Descuento, cmd.NumeroCuotas, cmd.FechaInicioCuotas,
            cmd.Observacion, cmd.Lineas, cmd.Abonos, cmd.CreatedBy, ct);
    }
}
