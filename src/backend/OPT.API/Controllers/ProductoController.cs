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
        [FromQuery] string? busqueda,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new GetProductosQuery(
            TenantId: tenantService.TenantId,
            TipoProducto: tipo,
            CategoriaId: categoriaId,
            Busqueda: busqueda,
            Page: page,
            PageSize: pageSize);

        var result = await mediator.Send(query, cancellationToken);
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
                Status = 404,
                Title = "Recurso no encontrado",
                Detail = $"Producto {id} no encontrado.",
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
        var command = new CreateProductoCommand(
            TenantId: tenantService.TenantId,
            CategoriaId: request.CategoriaId,
            Nombre: request.Nombre,
            Descripcion: request.Descripcion,
            TipoProducto: request.TipoProducto,
            CodigoInterno: request.CodigoInterno,
            CreatedBy: User.Identity?.Name ?? "system");

        var id = await mediator.Send(command, cancellationToken);
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
        var command = new UpdateProductoCommand(
            ProductoId: id,
            TenantId: tenantService.TenantId,
            CategoriaId: request.CategoriaId,
            Nombre: request.Nombre,
            Descripcion: request.Descripcion,
            TipoProducto: request.TipoProducto,
            CodigoInterno: request.CodigoInterno,
            Activo: request.Activo,
            UpdatedBy: User.Identity?.Name ?? "system");

        await mediator.Send(command, cancellationToken);
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

    // ── GET /api/productos/{id}/variantes ────────────────────────────────

    [HttpGet("{id:guid}/variantes")]
    [ProducesResponseType(typeof(IReadOnlyList<ProductoVarianteDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVariantes(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetVariantesByProductoQuery(id, tenantService.TenantId), cancellationToken);
        return Ok(result);
    }

    // ── POST /api/productos/{id}/variantes ───────────────────────────────

    [HttpPost("{id:guid}/variantes")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateVariante(
        Guid id,
        [FromBody] CreateProductoVarianteRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateProductoVarianteCommand(
            ProductoId: id,
            TenantId: tenantService.TenantId,
            Nombre: request.Nombre,
            CodigoBarras: request.CodigoBarras,
            CreatedBy: User.Identity?.Name ?? "system");

        var varianteId = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetVariantes), new { id }, new { id = varianteId });
    }

    // ── PUT /api/productos/{id}/variantes/{varianteId} ───────────────────

    [HttpPut("{id:guid}/variantes/{varianteId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateVariante(
        Guid id,
        Guid varianteId,
        [FromBody] UpdateProductoVarianteRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateProductoVarianteCommand(
            VarianteId: varianteId,
            ProductoId: id,
            TenantId: tenantService.TenantId,
            Nombre: request.Nombre,
            CodigoBarras: request.CodigoBarras,
            Activo: request.Activo,
            UpdatedBy: User.Identity?.Name ?? "system");

        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    // ── DELETE /api/productos/{id}/variantes/{varianteId} ────────────────

    [HttpDelete("{id:guid}/variantes/{varianteId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteVariante(
        Guid id,
        Guid varianteId,
        CancellationToken cancellationToken)
    {
        await mediator.Send(
            new DeleteProductoVarianteCommand(varianteId, tenantService.TenantId, User.Identity?.Name ?? "system"),
            cancellationToken);
        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CreateProductoRequest(
    Guid? CategoriaId,
    string Nombre,
    string? Descripcion,
    string TipoProducto,
    string? CodigoInterno);

public record UpdateProductoRequest(
    Guid? CategoriaId,
    string Nombre,
    string? Descripcion,
    string TipoProducto,
    string? CodigoInterno,
    bool Activo);

public record CreateProductoVarianteRequest(
    string Nombre,
    string? CodigoBarras);

public record UpdateProductoVarianteRequest(
    string Nombre,
    string? CodigoBarras,
    bool Activo);
