using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Application.OrdenTrabajo.Commands;
using OPT.Application.OrdenTrabajo.DTOs;
using OPT.Application.OrdenTrabajo.Queries;

namespace OPT.API.Controllers;

/// <summary>
/// Gestión de Órdenes de Trabajo (OT).
/// Los endpoints que filtran por sucursal aceptan el header X-Sucursal-Id (opcional).
/// </summary>
[ApiController]
[Route("api/ordenes-trabajo")]
[Authorize]
public class OrdenTrabajoController(
    IMediator mediator,
    ICurrentTenantService tenantService) : ControllerBase
{
    private Guid? ParseSucursalHeader()
    {
        var header = Request.Headers["X-Sucursal-Id"].FirstOrDefault();
        return Guid.TryParse(header, out var id) ? id : null;
    }

    // ── GET /api/ordenes-trabajo ───────────────────────────────────────────
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<OrdenTrabajoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page          = 1,
        [FromQuery] int pageSize      = 50,
        [FromQuery] string? numeroOT  = null,
        [FromQuery] Guid? clienteId   = null,
        [FromQuery] string? estadoPago = null,
        [FromQuery] string? etapaOT   = null,
        CancellationToken cancellationToken = default)
    {
        var sucursalId = ParseSucursalHeader();

        return Ok(await mediator.Send(new GetOrdenesTrabajoQuery(
            TenantId:   tenantService.TenantId,
            SucursalId: sucursalId,
            Page:       page,
            PageSize:   pageSize,
            NumeroOT:   numeroOT,
            ClienteId:  clienteId,
            EstadoPago: estadoPago,
            EtapaOT:    etapaOT), cancellationToken));
    }

    // ── GET /api/ordenes-trabajo/verificar-numero ─────────────────────────
    [HttpGet("verificar-numero")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerificarNumero(
        [FromQuery] string numero,
        [FromQuery] Guid? excluirId = null,
        CancellationToken cancellationToken = default)
    {
        var existe = await mediator.Send(
            new VerificarNumeroOTQuery(numero, tenantService.TenantId, excluirId),
            cancellationToken);

        return Ok(new { existe });
    }

    // ── GET /api/ordenes-trabajo/{id} ─────────────────────────────────────
    [HttpGet("{id:guid}", Name = nameof(GetById))]
    [ProducesResponseType(typeof(OrdenTrabajoDetalleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetOrdenTrabajoByIdQuery(id, tenantService.TenantId),
            cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    // ── POST /api/ordenes-trabajo ─────────────────────────────────────────
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Crear(
        [FromBody] CrearOrdenTrabajoRequest req,
        CancellationToken cancellationToken = default)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null)
            return BadRequest(new ProblemDetails
            {
                Status   = 400,
                Title    = "Header requerido",
                Detail   = "El header 'X-Sucursal-Id' es obligatorio para crear una OT.",
                Instance = HttpContext.Request.Path
            });

        var lineas = req.Lineas.Select(l => new OTLineaInput(
            l.ProductoId, l.Cantidad, l.ValorUnitario, l.Comentario)).ToList();

        var abonos = req.Abonos.Select(a => new OTAbonoInput(
            a.FormaPagoId, a.Monto, a.FechaPago, a.Observacion)).ToList();

        var otId = await mediator.Send(new CrearOrdenTrabajoCommand(
            TenantId:          tenantService.TenantId,
            SucursalId:        sucursalId.Value,
            NumeroOT:          req.NumeroOT,
            ClienteId:         req.ClienteId,
            TipoFacturacion:   req.TipoFacturacion,
            EmpresaClienteId:  req.EmpresaClienteId,
            Beneficiario:      req.Beneficiario,
            AtencionId:        req.AtencionId,
            RecetaCristalesId: req.RecetaCristalesId,
            FechaEntrega:      req.FechaEntrega,
            HoraEntrega:       req.HoraEntrega,
            Descuento:         req.Descuento,
            NumeroCuotas:      req.NumeroCuotas,
            FechaInicioCuotas: req.FechaInicioCuotas,
            Observacion:       req.Observacion,
            Lineas:            lineas,
            Abonos:            abonos,
            CreatedBy:         tenantService.RutUsuario), cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = otId }, new { otId });
    }

    // ── PUT /api/ordenes-trabajo/{id} ─────────────────────────────────────
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Editar(
        Guid id,
        [FromBody] EditarOrdenTrabajoRequest req,
        CancellationToken cancellationToken = default)
    {
        var lineas = req.Lineas.Select(l => new OTLineaInput(
            l.ProductoId, l.Cantidad, l.ValorUnitario, l.Comentario)).ToList();

        var abonos = req.Abonos.Select(a => new OTAbonoInput(
            a.FormaPagoId, a.Monto, a.FechaPago, a.Observacion)).ToList();

        await mediator.Send(new EditarOrdenTrabajoCommand(
            OTId:              id,
            TenantId:          tenantService.TenantId,
            NumeroOT:          req.NumeroOT,
            ClienteId:         req.ClienteId,
            TipoFacturacion:   req.TipoFacturacion,
            EmpresaClienteId:  req.EmpresaClienteId,
            Beneficiario:      req.Beneficiario,
            RecetaCristalesId: req.RecetaCristalesId,
            FechaEntrega:      req.FechaEntrega,
            HoraEntrega:       req.HoraEntrega,
            Descuento:         req.Descuento,
            NumeroCuotas:      req.NumeroCuotas,
            FechaInicioCuotas: req.FechaInicioCuotas,
            Observacion:       req.Observacion,
            Lineas:            lineas,
            Abonos:            abonos,
            UpdatedBy:         tenantService.RutUsuario), cancellationToken);

        return NoContent();
    }

    // ── DELETE /api/ordenes-trabajo/{id} ──────────────────────────────────
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Eliminar(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        await mediator.Send(
            new EliminarOrdenTrabajoCommand(id, tenantService.TenantId, tenantService.RutUsuario),
            cancellationToken);

        return NoContent();
    }

    // ── PATCH /api/ordenes-trabajo/{id}/etapa ─────────────────────────────
    [HttpPatch("{id:guid}/etapa")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CambiarEtapa(
        Guid id,
        [FromBody] CambiarEtapaOTRequest req,
        CancellationToken cancellationToken = default)
    {
        await mediator.Send(new CambiarEtapaOTCommand(
            OTId:       id,
            TenantId:   tenantService.TenantId,
            NuevaEtapa: req.Etapa,
            Observacion: req.Observacion,
            Responsable: tenantService.RutUsuario), cancellationToken);

        return NoContent();
    }

    // ── POST /api/ordenes-trabajo/{id}/pagos ──────────────────────────────
    [HttpPost("{id:guid}/pagos")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RegistrarPago(
        Guid id,
        [FromBody] RegistrarPagoOTRequest req,
        CancellationToken cancellationToken = default)
    {
        var pagoId = await mediator.Send(new RegistrarPagoOTCommand(
            OTId:        id,
            TenantId:    tenantService.TenantId,
            FormaPagoId: req.FormaPagoId,
            Monto:       req.Monto,
            FechaPago:   req.FechaPago,
            Observacion: req.Observacion,
            CreatedBy:   tenantService.RutUsuario), cancellationToken);

        return Ok(new { pagoId });
    }
}

// ── Request records ────────────────────────────────────────────────────────────

public record CrearOrdenTrabajoRequest(
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
    IReadOnlyList<OTLineaRequestItem> Lineas,
    IReadOnlyList<OTAbonoRequestItem> Abonos);

public record EditarOrdenTrabajoRequest(
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
    IReadOnlyList<OTLineaRequestItem> Lineas,
    IReadOnlyList<OTAbonoRequestItem> Abonos);

public record OTLineaRequestItem(
    Guid ProductoId,
    int Cantidad,
    decimal ValorUnitario,
    string? Comentario);

public record OTAbonoRequestItem(
    int FormaPagoId,
    decimal Monto,
    DateOnly FechaPago,
    string? Observacion);

public record CambiarEtapaOTRequest(
    string Etapa,
    string? Observacion);

public record RegistrarPagoOTRequest(
    int FormaPagoId,
    decimal Monto,
    DateOnly FechaPago,
    string? Observacion);
