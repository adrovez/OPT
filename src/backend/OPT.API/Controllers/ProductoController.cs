using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Application.Productos.Commands;
using OPT.Application.Productos.DTOs;
using OPT.Application.Productos.Queries;

namespace OPT.API.Controllers;

[ApiController]
[Route("api/productos")]
[Authorize]
public class ProductoController(IMediator mediator, ICurrentTenantService tenantService)
    : ControllerBase
{
    // ── GET /api/productos ───────────────────────────────────────────────
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ProductoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? tipo,
        [FromQuery] Guid? categoriaId,
        [FromQuery] bool soloRaices = false,
        [FromQuery] Guid? padreId = null,
        [FromQuery] string? busqueda = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetProductosQuery(
            TenantId:    tenantService.TenantId,
            Tipo:        tipo,
            CategoriaId: categoriaId,
            SoloRaices:  soloRaices,
            PadreId:     padreId,
            Busqueda:    busqueda,
            Page:        page,
            PageSize:    pageSize),
            cancellationToken);

        return Ok(result);
    }

    // ── GET /api/productos/{id} ──────────────────────────────────────────
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProductoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetProductoByIdQuery(id, tenantService.TenantId), cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status   = 404,
                Title    = "Recurso no encontrado",
                Detail   = $"Producto {id} no encontrado.",
                Instance = HttpContext.Request.Path
            })
            : Ok(result);
    }

    // ── POST /api/productos ──────────────────────────────────────────────
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductoRequest request,
        CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new CreateProductoCommand(
            TenantId:       tenantService.TenantId,
            CodigoInterno:  request.CodigoInterno,
            Nombre:         request.Nombre,
            Descripcion:    request.Descripcion,
            Tipo:           request.Tipo,
            UnidadMedida:   request.UnidadMedida,
            CategoriaId:    request.CategoriaId,
            ProductoPadreId: request.ProductoPadreId,
            CreatedBy:      User.Identity?.Name ?? "system"),
            cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    // ── PUT /api/productos/{id} ──────────────────────────────────────────
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateProductoRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new UpdateProductoCommand(
            ProductoId:     id,
            TenantId:       tenantService.TenantId,
            CodigoInterno:  request.CodigoInterno,
            Nombre:         request.Nombre,
            Descripcion:    request.Descripcion,
            Tipo:           request.Tipo,
            UnidadMedida:   request.UnidadMedida,
            CategoriaId:    request.CategoriaId,
            ProductoPadreId: request.ProductoPadreId,
            IsActivo:       request.IsActivo,
            UpdatedBy:      User.Identity?.Name ?? "system"),
            cancellationToken);

        return NoContent();
    }

    // ── DELETE /api/productos/{id} ───────────────────────────────────────
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(
            new DeleteProductoCommand(id, tenantService.TenantId, User.Identity?.Name ?? "system"),
            cancellationToken);
        return NoContent();
    }

    // ── PUT /api/productos/{id}/precio ───────────────────────────────────
    [HttpPut("{id:guid}/precio")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetPrecio(
        Guid id,
        [FromBody] SetPrecioProductoRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new SetPrecioProductoCommand(
            ProductoId:  id,
            TenantId:    tenantService.TenantId,
            PrecioCosto: request.PrecioCosto,
            PrecioVenta: request.PrecioVenta,
            CreatedBy:   User.Identity?.Name ?? "system"),
            cancellationToken);

        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CreateProductoRequest(
    string CodigoInterno,
    string Nombre,
    string? Descripcion,
    string Tipo,
    string? UnidadMedida,
    Guid? CategoriaId,
    Guid? ProductoPadreId);

public record UpdateProductoRequest(
    string CodigoInterno,
    string Nombre,
    string? Descripcion,
    string Tipo,
    string? UnidadMedida,
    Guid? CategoriaId,
    Guid? ProductoPadreId,
    bool IsActivo);

public record SetPrecioProductoRequest(
    decimal? PrecioCosto,
    decimal? PrecioVenta);
