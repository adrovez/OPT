using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Application.Stock.Commands;
using OPT.Application.Stock.DTOs;
using OPT.Application.Stock.Queries;

namespace OPT.API.Controllers;

/// <summary>
/// Gestión de stock por producto y sucursal.
/// Todos los endpoints requieren JWT válido y el header X-Sucursal-Id.
/// Las entradas de stock se registran exclusivamente via /api/documentos-entrada.
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
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<StockDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetStock(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        return Ok(await mediator.Send(
            new GetStockBySucursalQuery(tenantService.TenantId, sucursalId.Value, page, pageSize),
            cancellationToken));
    }

    // ── GET /api/stock/{productoId} ──────────────────────────────────────────
    [HttpGet("{productoId:guid}")]
    [ProducesResponseType(typeof(StockDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByProducto(Guid productoId, CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        var result = await mediator.Send(
            new GetStockByProductoQuery(tenantService.TenantId, sucursalId.Value, productoId),
            cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status   = 404,
                Title    = "Recurso no encontrado",
                Detail   = $"No hay registro de stock para el producto {productoId} en esta sucursal.",
                Instance = HttpContext.Request.Path
            })
            : Ok(result);
    }

    // ── POST /api/stock/movimiento ───────────────────────────────────────────
    /// <summary>
    /// Registra un movimiento directo: Salida, Ajuste, Merma o DevolucionProveedor.
    /// Las entradas se registran exclusivamente via DocumentoEntrada.
    /// </summary>
    [HttpPost("movimiento")]
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
            ProductoId:     request.ProductoId,
            UsuarioId:      tenantService.UsuarioId,
            TipoMovimiento: request.TipoMovimiento,
            Cantidad:       request.Cantidad,
            Referencia:     request.Referencia,
            Observacion:    request.Observacion,
            CreatedBy:      tenantService.RutUsuario),
            cancellationToken);

        return CreatedAtAction(
            nameof(GetByProducto),
            new { productoId = request.ProductoId },
            new { movimientoId });
    }

    // ── GET /api/stock/movimientos ───────────────────────────────────────────
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

// ── Request record ────────────────────────────────────────────────────────────

public record RegistrarMovimientoRequest(
    Guid ProductoId,
    string TipoMovimiento,
    int Cantidad,
    string? Referencia,
    string? Observacion);
