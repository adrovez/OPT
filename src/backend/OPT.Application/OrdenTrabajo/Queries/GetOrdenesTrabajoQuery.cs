using MediatR;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Application.OrdenTrabajo.DTOs;
using OTEntity = OPT.Domain.Entities.OrdenTrabajo;

namespace OPT.Application.OrdenTrabajo.Queries;

public record GetOrdenesTrabajoQuery(
    Guid TenantId,
    Guid? SucursalId,
    int Page,
    int PageSize,
    string? NumeroOT,
    Guid? ClienteId,
    string? EstadoPago,
    string? EtapaOT) : IRequest<PagedResult<OrdenTrabajoDto>>;

public class GetOrdenesTrabajoQueryHandler(IOrdenTrabajoRepository repository)
    : IRequestHandler<GetOrdenesTrabajoQuery, PagedResult<OrdenTrabajoDto>>
{
    public async Task<PagedResult<OrdenTrabajoDto>> Handle(GetOrdenesTrabajoQuery q, CancellationToken ct)
    {
        var paged = await repository.GetPagedAsync(
            q.TenantId, q.SucursalId, q.Page, q.PageSize,
            q.NumeroOT, q.ClienteId, q.EstadoPago, q.EtapaOT, ct);

        return new PagedResult<OrdenTrabajoDto>
        {
            Items      = paged.Items.Select(MapToDto).ToList(),
            TotalCount = paged.TotalCount,
            Page       = paged.Page,
            PageSize   = paged.PageSize
        };
    }

    private static OrdenTrabajoDto MapToDto(OTEntity ot) => new(
        OTId:              ot.OTId,
        NumeroOT:          ot.NumeroOT,
        ClienteId:         ot.ClienteId,
        ClienteNombre:     ot.Cliente?.Nombre ?? string.Empty,
        ClienteRut:        ot.Cliente?.NumeroDocumento ?? string.Empty,
        TipoFacturacion:   ot.TipoFacturacion,
        EmpresaClienteId:  ot.EmpresaClienteId,
        EmpresaNombre:     ot.EmpresaCliente?.Nombre,
        Beneficiario:      ot.Beneficiario,
        FechaIngreso:      ot.FechaIngreso,
        FechaEntrega:      ot.FechaEntrega,
        SubTotal:          ot.SubTotal,
        Descuento:         ot.Descuento,
        MontoTotal:        ot.MontoTotal,
        TotalAbonado:      ot.TotalAbonado,
        Saldo:             ot.Saldo,
        EstadoPago:        ot.EstadoPago,
        EtapaOT:           ot.EtapaOT
    );
}
