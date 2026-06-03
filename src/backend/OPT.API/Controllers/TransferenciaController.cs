using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Application.Transferencia.Commands;
using OPT.Application.Transferencia.DTOs;
using OPT.Application.Transferencia.Queries;

namespace OPT.API.Controllers;

/// <summary>
/// Transferencias de stock entre sucursales.
/// Requiere JWT válido. El header X-Sucursal-Id se usa como filtro opcional en GET.
/// </summary>
[ApiController]
[Route("api/transferencias")]
[Authorize]
public class TransferenciaController(
    IMediator mediator,
    ICurrentTenantService tenantService) : ControllerBase
{
    private Guid? ParseSucursalHeader()
    {
        var header = Request.Headers["X-Sucursal-Id"].FirstOrDefault();
        return Guid.TryParse(header, out var id) ? id : null;
    }

    // ── GET /api/transferencias ──────────────────────────────────────────────
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<TransferenciaDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? estado,
        [FromQuery] Guid? sucursalId,
        [FromQuery] int page     = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        // Si no se pasa sucursalId en query, usa el header X-Sucursal-Id como filtro contextual
        var filtroSucursal = sucursalId ?? ParseSucursalHeader();

        return Ok(await mediator.Send(
            new GetTransferenciasQuery(
                TenantId:   tenantService.TenantId,
                SucursalId: filtroSucursal,
                Estado:     estado,
                Page:       page,
                PageSize:   pageSize),
            cancellationToken));
    }

    // ── GET /api/transferencias/{id} ─────────────────────────────────────────
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TransferenciaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetTransferenciaByIdQuery(tenantService.TenantId, id),
            cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status   = 404,
                Title    = "Recurso no encontrado",
                Detail   = $"Transferencia {id} no encontrada.",
                Instance = HttpContext.Request.Path
            })
            : Ok(result);
    }

    // ── POST /api/transferencias ─────────────────────────────────────────────
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Crear(
        [FromBody] CrearTransferenciaRequest request,
        CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new CrearTransferenciaCommand(
            TenantId:           tenantService.TenantId,
            SucursalOrigenId:   request.SucursalOrigenId,
            SucursalDestinoId:  request.SucursalDestinoId,
            FechaTransferencia: request.FechaTransferencia,
            Observaciones:      request.Observaciones,
            Lineas:             request.Lineas
                .Select(l => new OPT.Application.Interfaces.TransferenciaLineaInput(l.ProductoId, l.Cantidad))
                .ToList(),
            UsuarioId:  tenantService.UsuarioId,
            CreatedBy:  tenantService.RutUsuario),
            cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    // ── PATCH /api/transferencias/{id}/estado ────────────────────────────────
    [HttpPatch("{id:guid}/estado")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CambiarEstado(
        Guid id,
        [FromBody] CambiarEstadoTransferenciaRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new CambiarEstadoTransferenciaCommand(
            TenantId:        tenantService.TenantId,
            TransferenciaId: id,
            Estado:          request.Estado,
            UsuarioId:       tenantService.UsuarioId,
            UpdatedBy:       tenantService.RutUsuario),
            cancellationToken);

        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CrearTransferenciaRequest(
    Guid SucursalOrigenId,
    Guid SucursalDestinoId,
    DateOnly FechaTransferencia,
    string? Observaciones,
    IReadOnlyList<CrearTransferenciaLineaRequest> Lineas);

public record CrearTransferenciaLineaRequest(Guid ProductoId, int Cantidad);

public record CambiarEstadoTransferenciaRequest(string Estado);
