using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Application.Precios.DTOs;
using OPT.Application.Precios.Queries;
using OPT.Application.Productos.Commands;

namespace OPT.API.Controllers;

/// <summary>
/// Mantenedor de precios de productos.
/// GET lista paginada de precios vigentes, GET historial por producto, PUT actualiza precio vigente.
/// </summary>
[ApiController]
[Route("api/precios")]
[Authorize]
public class PrecioController(IMediator mediator, ICurrentTenantService tenantService)
    : ControllerBase
{
    // ── GET /api/precios ─────────────────────────────────────────────────────
    /// <summary>Lista paginada de precios vigentes. Filtros: search (nombre/código), categoriaId.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<PrecioProductoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVigentes(
        [FromQuery] string? search,
        [FromQuery] Guid? categoriaId,
        [FromQuery] int page     = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
        => Ok(await mediator.Send(
            new GetPreciosVigentesQuery(
                tenantService.TenantId, search, categoriaId, page, pageSize),
            cancellationToken));

    // ── GET /api/precios/{productoId}/historial ───────────────────────────────
    /// <summary>Historial completo de precios de un producto, más reciente primero.</summary>
    [HttpGet("{productoId:guid}/historial")]
    [ProducesResponseType(typeof(IReadOnlyList<PrecioProductoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetHistorial(
        Guid productoId,
        CancellationToken cancellationToken)
        => Ok(await mediator.Send(
            new GetHistorialPreciosQuery(productoId, tenantService.TenantId),
            cancellationToken));

    // ── PUT /api/precios/{productoId} ─────────────────────────────────────────
    /// <summary>
    /// Actualiza el precio vigente de un producto.
    /// Cierra el precio actual (VigenciaHasta = now) y crea uno nuevo.
    /// </summary>
    [HttpPut("{productoId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetPrecio(
        Guid productoId,
        [FromBody] SetPrecioRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new SetPrecioProductoCommand(
            ProductoId:  productoId,
            TenantId:    tenantService.TenantId,
            PrecioCosto: request.PrecioCosto,
            PrecioVenta: request.PrecioVenta,
            CreatedBy:   tenantService.RutUsuario),
            cancellationToken);

        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record SetPrecioRequest(decimal? PrecioCosto, decimal? PrecioVenta);
