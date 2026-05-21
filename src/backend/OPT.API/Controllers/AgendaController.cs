using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Agenda.Commands;
using OPT.Application.Agenda.DTOs;
using OPT.Application.Agenda.Queries;
using OPT.Application.Interfaces;

namespace OPT.API.Controllers;

/// <summary>
/// Gestión de citas de la Agenda.
/// Todos los endpoints requieren JWT válido y el header X-Sucursal-Id con la sucursal activa.
/// </summary>
[ApiController]
[Route("api/agenda")]
[Authorize]
public class AgendaController(IMediator mediator, ICurrentTenantService tenantService) : ControllerBase
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

    // ── GET /api/agenda ──────────────────────────────────────────────────────

    /// <summary>
    /// Lista las citas de la sucursal activa.
    /// Filtros opcionales: desde, hasta (DateTime), estado, usuarioId.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AgendaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta,
        [FromQuery] string? estado,
        [FromQuery] Guid? usuarioId,
        CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        var query = new GetAgendasQuery(
            tenantService.TenantId, sucursalId.Value,
            desde, hasta, estado, usuarioId);

        return Ok(await mediator.Send(query, cancellationToken));
    }

    // ── GET /api/agenda/{id} ─────────────────────────────────────────────────

    /// <summary>Obtiene el detalle de una cita.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AgendaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetAgendaByIdQuery(id, tenantService.TenantId), cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status   = 404,
                Title    = "Recurso no encontrado",
                Detail   = $"Agenda {id} no encontrada.",
                Instance = HttpContext.Request.Path
            })
            : Ok(result);
    }

    // ── POST /api/agenda ─────────────────────────────────────────────────────

    /// <summary>Crea una nueva cita asociada a la sucursal activa del usuario.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateAgendaRequest request, CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        var command = new CreateAgendaCommand(
            TenantId:        tenantService.TenantId,
            SucursalId:      sucursalId.Value,
            ClienteId:       request.ClienteId,
            UsuarioId:       request.UsuarioId,
            FechaHora:       request.FechaHora,
            DuracionMinutos: request.DuracionMinutos,
            Motivo:          request.Motivo,
            Observaciones:   request.Observaciones,
            CreatedBy:       tenantService.RutUsuario);

        var id = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, null);
    }

    // ── PUT /api/agenda/{id} ─────────────────────────────────────────────────

    /// <summary>Actualiza fecha/hora, duración, profesional asignado u observaciones de la cita.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAgendaRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new UpdateAgendaCommand(
            AgendaId:        id,
            TenantId:        tenantService.TenantId,
            UsuarioId:       request.UsuarioId,
            FechaHora:       request.FechaHora,
            DuracionMinutos: request.DuracionMinutos,
            Motivo:          request.Motivo,
            Observaciones:   request.Observaciones,
            UpdatedBy:       tenantService.RutUsuario),
            cancellationToken);

        return NoContent();
    }

    // ── PATCH /api/agenda/{id}/estado ────────────────────────────────────────

    /// <summary>Cambia el estado de la cita: Pendiente | Confirmada | Atendida | Cancelada | NoShow.</summary>
    [HttpPatch("{id:guid}/estado")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CambiarEstado(Guid id, [FromBody] CambiarEstadoRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new CambiarEstadoAgendaCommand(
            AgendaId:  id,
            TenantId:  tenantService.TenantId,
            Estado:    request.Estado,
            UpdatedBy: tenantService.RutUsuario),
            cancellationToken);

        return NoContent();
    }

    // ── DELETE /api/agenda/{id} ──────────────────────────────────────────────

    /// <summary>Elimina lógicamente la cita (soft delete).</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteAgendaCommand(
            AgendaId:  id,
            TenantId:  tenantService.TenantId,
            DeletedBy: tenantService.RutUsuario),
            cancellationToken);

        return NoContent();
    }
}

// ── Request DTOs (solo para este controller, no atraviesan capas) ────────────

public record CreateAgendaRequest(
    Guid ClienteId,
    Guid? UsuarioId,
    DateTime FechaHora,
    short DuracionMinutos,
    string Motivo,
    string? Observaciones);

public record UpdateAgendaRequest(
    Guid? UsuarioId,
    DateTime FechaHora,
    short DuracionMinutos,
    string Motivo,
    string? Observaciones);

public record CambiarEstadoRequest(string Estado);
