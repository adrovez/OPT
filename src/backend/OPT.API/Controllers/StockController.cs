using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Interfaces;
using OPT.Application.Stock.Commands;
using OPT.Application.Stock.DTOs;
using OPT.Application.Stock.Queries;

namespace OPT.API.Controllers;

/// <summary>
/// Gestión de stock por variante y sucursal.
/// Todos los endpoints requieren JWT válido y el header X-Sucursal-Id.
/// </summary>
[ApiController]
[Route("api/stock")]
[Authorize]
public class StockController(IMediator mediator, ICurrentTenantService tenantService) : ControllerBase
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

    // ── GET /api/stock ───────────────────────────────────────────────────────

    /// <summary>Lista el stock de todas las variantes en la sucursal activa.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<StockDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetStock(CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        return Ok(await mediator.Send(
            new GetStockBySucursalQuery(tenantService.TenantId, sucursalId.Value),
            cancellationToken));
    }

    // ── GET /api/stock/{varianteId} ──────────────────────────────────────────

    /// <summary>Obtiene el stock de una variante específica en la sucursal activa.</summary>
    [HttpGet("{varianteId:guid}")]
    [ProducesResponseType(typeof(StockDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByVariante(Guid varianteId, CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        var result = await mediator.Send(
            new GetStockByVarianteQuery(tenantService.TenantId, sucursalId.Value, varianteId),
            cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status   = 404,
                Title    = "Recurso no encontrado",
                Detail   = $"No hay registro de stock para la variante {varianteId} en esta sucursal.",
                Instance = HttpContext.Request.Path
            })
            : Ok(result);
    }

    // ── POST /api/stock/movimientos ──────────────────────────────────────────

    /// <summary>
    /// Registra un movimiento de stock (Entrada, Salida o Ajuste).
    /// Si la variante no tiene stock previo en esta sucursal, se crea automáticamente.
    /// Ajuste acepta Cantidad positiva (suma) o negativa (resta).
    /// </summary>
    [HttpPost("movimientos")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegistrarMovimiento(
        [FromBody] RegistrarMovimientoRequest request,
        CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        var movimientoId = await mediator.Send(new RegistrarMovimientoCommand(
            TenantId:       tenantService.TenantId,
            SucursalId:     sucursalId.Value,
            VarianteId:     request.VarianteId,
            UsuarioId:      tenantService.UsuarioId,
            TipoMovimiento: request.TipoMovimiento,
            Cantidad:       request.Cantidad,
            Referencia:     request.Referencia,
            Observacion:    request.Observacion,
            CreatedBy:      tenantService.RutUsuario),
            cancellationToken);

        return CreatedAtAction(nameof(GetByVariante), new { varianteId = request.VarianteId }, new { movimientoId });
    }

    // ── GET /api/stock/movimientos ───────────────────────────────────────────

    /// <summary>
    /// Historial de movimientos de la sucursal activa.
    /// Filtros opcionales: desde, hasta (DateTime), tipo ('Entrada'|'Salida'|'Ajuste').
    /// </summary>
    [HttpGet("movimientos")]
    [ProducesResponseType(typeof(IReadOnlyList<MovimientoStockDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetHistorial(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta,
        [FromQuery] string? tipo,
        CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        return Ok(await mediator.Send(
            new GetHistorialMovimientosQuery(tenantService.TenantId, sucursalId.Value, desde, hasta, tipo),
            cancellationToken));
    }
}

// ── Request record (solo para este controller) ───────────────────────────────

public record RegistrarMovimientoRequest(
    Guid VarianteId,
    string TipoMovimiento,
    int Cantidad,
    string? Referencia,
    string? Observacion);
