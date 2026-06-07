using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.OrdenTrabajo.DTOs;
using OTEntity = OPT.Domain.Entities.OrdenTrabajo;

namespace OPT.Application.OrdenTrabajo.Queries;

public record GetOrdenTrabajoByIdQuery(
    Guid OTId,
    Guid TenantId) : IRequest<OrdenTrabajoDetalleDto?>;

public class GetOrdenTrabajoByIdQueryHandler(IOrdenTrabajoRepository repository)
    : IRequestHandler<GetOrdenTrabajoByIdQuery, OrdenTrabajoDetalleDto?>
{
    public async Task<OrdenTrabajoDetalleDto?> Handle(GetOrdenTrabajoByIdQuery q, CancellationToken ct)
    {
        var ot = await repository.GetByIdAsync(q.OTId, q.TenantId, ct);
        return ot is null ? null : MapToDetalle(ot);
    }

    private static OrdenTrabajoDetalleDto MapToDetalle(OTEntity ot) => new(
        OTId:              ot.OTId,
        NumeroOT:          ot.NumeroOT,
        ClienteId:         ot.ClienteId,
        ClienteNombre:     ot.Cliente?.Nombre ?? string.Empty,
        ClienteRut:        ot.Cliente?.NumeroDocumento ?? string.Empty,
        TipoFacturacion:   ot.TipoFacturacion,
        EmpresaClienteId:  ot.EmpresaClienteId,
        EmpresaNombre:     ot.EmpresaCliente?.Nombre,
        Beneficiario:      ot.Beneficiario,
        AtencionId:        ot.AtencionId,
        RecetaCristalesId: ot.RecetaCristalesId,
        FechaIngreso:      ot.FechaIngreso,
        FechaEntrega:      ot.FechaEntrega,
        HoraEntrega:       ot.HoraEntrega,
        SubTotal:          ot.SubTotal,
        Descuento:         ot.Descuento,
        MontoTotal:        ot.MontoTotal,
        TotalAbonado:      ot.TotalAbonado,
        Saldo:             ot.Saldo,
        NumeroCuotas:      ot.NumeroCuotas,
        FechaInicioCuotas: ot.FechaInicioCuotas,
        EstadoPago:        ot.EstadoPago,
        EtapaOT:           ot.EtapaOT,
        Observacion:       ot.Observacion,
        CreatedAt:         ot.CreatedAt,
        CreatedBy:         ot.CreatedBy,
        Lineas:            ot.Lineas
                             .Where(l => !l.IsDeleted)
                             .Select(l => new OrdenTrabajoLineaDto(
                                 LineaId:       l.LineaId,
                                 ProductoId:    l.ProductoId,
                                 ProductoNombre: l.Producto?.Nombre ?? string.Empty,
                                 CodigoInterno: l.Producto?.CodigoInterno ?? string.Empty,
                                 Cantidad:      l.Cantidad,
                                 ValorUnitario: l.ValorUnitario,
                                 SubtotalLinea: l.Cantidad * l.ValorUnitario,
                                 Comentario:    l.Comentario))
                             .ToList(),
        Pagos:             ot.Pagos
                             .Where(p => !p.IsDeleted)
                             .Select(p => new OrdenTrabajoPagoDto(
                                 PagoId:               p.PagoId,
                                 FormaPagoId:          p.FormaPagoId,
                                 FormaPagoDescripcion: p.FormaPago?.Descripcion ?? string.Empty,
                                 Monto:                p.Monto,
                                 FechaPago:            p.FechaPago,
                                 EsAbono:              p.EsAbono,
                                 Observacion:          p.Observacion,
                                 CreatedAt:            p.CreatedAt,
                                 CreatedBy:            p.CreatedBy))
                             .ToList(),
        Cuotas:            ot.Cuotas
                             .Where(c => !c.IsDeleted)
                             .Select(c => new OrdenTrabajoCuotaDto(
                                 CuotaId:          c.CuotaId,
                                 Numero:           c.Numero,
                                 ValorCuota:       c.ValorCuota,
                                 FechaVencimiento: c.FechaVencimiento,
                                 FechaPago:        c.FechaPago,
                                 Estado:           c.Estado))
                             .ToList(),
        Bitacora:          ot.Bitacora
                             .OrderBy(b => b.Fecha)
                             .Select(b => new OrdenTrabajoBitacoraDto(
                                 BitacoraId:  b.BitacoraId,
                                 Etapa:       b.Etapa,
                                 Fecha:       b.Fecha,
                                 Responsable: b.Responsable,
                                 Observacion: b.Observacion))
                             .ToList()
    );
}
