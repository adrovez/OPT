using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Atencion.Commands;
using OPT.Application.Atencion.DTOs;
using OPT.Application.Atencion.Queries;
using OPT.Application.Interfaces;

namespace OPT.API.Controllers;

/// <summary>
/// Gestión de Atenciones clínicas.
/// Todos los endpoints requieren JWT válido y el header X-Sucursal-Id.
/// </summary>
[ApiController]
[Route("api/atenciones")]
[Authorize]
public class AtencionesController(IMediator mediator, ICurrentTenantService tenantService) : ControllerBase
{
    private Guid? ParseSucursalHeader()
    {
        var header = Request.Headers["X-Sucursal-Id"].FirstOrDefault();
        return Guid.TryParse(header, out var id) ? id : null;
    }

    private IActionResult SucursalRequerida() => BadRequest(new ProblemDetails
    {
        Status   = 400,
        Title    = "Header requerido",
        Detail   = "El header 'X-Sucursal-Id' es obligatorio y debe ser un GUID válido.",
        Instance = HttpContext.Request.Path
    });

    // ── GET /api/atenciones ──────────────────────────────────────────────────

    /// <summary>
    /// Lista las atenciones de la sucursal activa.
    /// Filtros opcionales: desde, hasta (DateTime ISO), estado.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AtencionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta,
        [FromQuery] string? estado,
        CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        var query = new GetAtencionesQuery(
            tenantService.TenantId, sucursalId.Value,
            desde, hasta, estado);

        return Ok(await mediator.Send(query, cancellationToken));
    }

    // ── GET /api/atenciones/{id} ─────────────────────────────────────────────

    /// <summary>Obtiene el detalle de una atención, incluyendo CobroServicio si existe.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AtencionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetAtencionByIdQuery(id, tenantService.TenantId), cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status   = 404,
                Title    = "Recurso no encontrado",
                Detail   = $"Atención {id} no encontrada.",
                Instance = HttpContext.Request.Path
            })
            : Ok(result);
    }

    // ── POST /api/atenciones ─────────────────────────────────────────────────

    /// <summary>
    /// Crea una nueva atención. Si agendaId está presente, la cita pasa a estado 'Atendida'.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateAtencionRequest request,
        CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        var command = new CreateAtencionCommand(
            TenantId:         tenantService.TenantId,
            SucursalId:       sucursalId.Value,
            AgendaId:         request.AgendaId,
            ClienteId:        request.ClienteId,
            UsuarioAtencionId: request.UsuarioAtencionId,
            FechaHoraAtencion: request.FechaHoraAtencion,
            Motivo:           request.Motivo,
            Observaciones:    request.Observaciones,
            CreatedBy:        tenantService.RutUsuario);

        var id = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, null);
    }

    // ── POST /api/atenciones/iniciar ────────────────────────────────────────

    /// <summary>
    /// Inicia una atención desde una cita Confirmada: crea Atención + Anamnesis + RecetaCristales
    /// en una sola operación. La cita pasa a estado 'Atendida'.
    /// </summary>
    [HttpPost("iniciar")]
    [ProducesResponseType(typeof(IniciarAtencionResult), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Iniciar(
        [FromBody] IniciarAtencionRequest request,
        CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        var result = await mediator.Send(new IniciarAtencionCommand(
            TenantId:          tenantService.TenantId,
            SucursalId:        sucursalId.Value,
            CreatedBy:         tenantService.RutUsuario,
            AgendaId:          request.AgendaId,
            ClienteId:         request.ClienteId,
            UsuarioAtencionId: request.UsuarioAtencionId,
            FechaHoraAtencion: request.FechaHoraAtencion,
            Motivo:            request.Motivo,
            Observaciones:     request.Observaciones,
            Hipertension:      request.Hipertension,
            Diabetes:          request.Diabetes,
            Alergias:          request.Alergias,
            UsaLentes:         request.UsaLentes,
            AnamnesisObservacion: request.AnamnesisObservacion,
            LejosODEsferico:   request.LejosODEsferico,
            LejosODCilindro:   request.LejosODCilindro,
            LejosODEje:        request.LejosODEje,
            LejosODObservacion: request.LejosODObservacion,
            LejosOIEsferico:   request.LejosOIEsferico,
            LejosOICilindro:   request.LejosOICilindro,
            LejosOIEje:        request.LejosOIEje,
            LejosOIObservacion: request.LejosOIObservacion,
            LejosDPEsferico:   request.LejosDPEsferico,
            LejosDPObservacion: request.LejosDPObservacion,
            CercaODEsferico:   request.CercaODEsferico,
            CercaODCilindro:   request.CercaODCilindro,
            CercaODEje:        request.CercaODEje,
            CercaODObservacion: request.CercaODObservacion,
            CercaOIEsferico:   request.CercaOIEsferico,
            CercaOICilindro:   request.CercaOICilindro,
            CercaOIEje:        request.CercaOIEje,
            CercaOIObservacion: request.CercaOIObservacion,
            CercaDPEsferico:   request.CercaDPEsferico,
            CercaDPObservacion: request.CercaDPObservacion,
            LejosADDEsfera:    request.LejosADDEsfera,
            CheckLejos:        request.CheckLejos,
            CheckCerca:        request.CheckCerca,
            CheckCristalesLaboratorio: request.CheckCristalesLaboratorio,
            CheckUrgente:      request.CheckUrgente),
            cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = result.AtencionId }, result);
    }

    // ── PUT /api/atenciones/{id}/terminar ────────────────────────────────────

    /// <summary>
    /// Cambia el estado de la atención a 'TerminadaServicio'. Prerequisito para RegistrarCobro.
    /// </summary>
    [HttpPut("{id:guid}/terminar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Terminar(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new TerminarAtencionCommand(
            AtencionId: id,
            TenantId:   tenantService.TenantId,
            UpdatedBy:  tenantService.RutUsuario),
            cancellationToken);

        return NoContent();
    }

    // ── PUT /api/atenciones/{id}/derivar-ot ─────────────────────────────────

    /// <summary>Cambia el estado de la atención a 'DerivoOT'.</summary>
    [HttpPut("{id:guid}/derivar-ot")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DerivarAOT(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new DerivarAOTCommand(
            AtencionId: id,
            TenantId:   tenantService.TenantId,
            UpdatedBy:  tenantService.RutUsuario),
            cancellationToken);

        return NoContent();
    }

    // ── POST /api/atenciones/{id}/cobro-servicio ─────────────────────────────

    /// <summary>
    /// Registra el cobro de una atención en estado 'TerminadaServicio'.
    /// </summary>
    [HttpPost("{id:guid}/cobro-servicio")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RegistrarCobro(
        Guid id,
        [FromBody] RegistrarCobroRequest request,
        CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        var cobroId = await mediator.Send(new RegistrarCobroServicioCommand(
            TenantId:     tenantService.TenantId,
            SucursalId:   sucursalId.Value,
            AtencionId:   id,
            FormaPagoId:  request.FormaPagoId,
            Monto:        request.Monto,
            Observaciones: request.Observaciones,
            CreatedBy:    tenantService.RutUsuario),
            cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id }, new { cobroServicioId = cobroId });
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CreateAtencionRequest(
    Guid? AgendaId,
    Guid ClienteId,
    Guid UsuarioAtencionId,
    DateTime FechaHoraAtencion,
    string Motivo,
    string? Observaciones);

public record RegistrarCobroRequest(
    int FormaPagoId,
    decimal Monto,
    string? Observaciones);

public record IniciarAtencionRequest(
    // Atención
    Guid? AgendaId,
    Guid ClienteId,
    Guid UsuarioAtencionId,
    DateTime FechaHoraAtencion,
    string Motivo,
    string? Observaciones,

    // Anamnesis
    bool Hipertension,
    bool Diabetes,
    bool Alergias,
    bool UsaLentes,
    string? AnamnesisObservacion,

    // RecetaCristales — Lejos
    string? LejosODEsferico,
    string? LejosODCilindro,
    string? LejosODEje,
    string? LejosODObservacion,
    string? LejosOIEsferico,
    string? LejosOICilindro,
    string? LejosOIEje,
    string? LejosOIObservacion,
    string? LejosDPEsferico,
    string? LejosDPObservacion,

    // RecetaCristales — Cerca
    string? CercaODEsferico,
    string? CercaODCilindro,
    string? CercaODEje,
    string? CercaODObservacion,
    string? CercaOIEsferico,
    string? CercaOICilindro,
    string? CercaOIEje,
    string? CercaOIObservacion,
    string? CercaDPEsferico,
    string? CercaDPObservacion,

    // RecetaCristales — ADD y Flags
    string? LejosADDEsfera,
    bool CheckLejos,
    bool CheckCerca,
    bool CheckCristalesLaboratorio,
    bool CheckUrgente);
