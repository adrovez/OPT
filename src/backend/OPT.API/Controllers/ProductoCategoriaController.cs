using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Categorias.Commands;
using OPT.Application.Categorias.DTOs;
using OPT.Application.Categorias.Queries;
using OPT.Application.Interfaces;

namespace OPT.API.Controllers;

/// <summary>
/// Gestión de categorías de productos.
/// Ruta mantenida como /api/categorias para el nuevo esquema 027.
/// </summary>
[ApiController]
[Route("api/categorias")]
[Authorize]
public class CategoriaController(IMediator mediator, ICurrentTenantService tenantService)
    : ControllerBase
{
    // ── GET /api/categorias ──────────────────────────────────────────────
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CategoriaDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool soloActivas = true,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetCategoriasQuery(tenantService.TenantId, soloActivas),
            cancellationToken);
        return Ok(result);
    }

    // ── GET /api/categorias/{id} ─────────────────────────────────────────
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CategoriaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetCategoriaByIdQuery(id, tenantService.TenantId), cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status   = 404,
                Title    = "Recurso no encontrado",
                Detail   = $"Categoría {id} no encontrada.",
                Instance = HttpContext.Request.Path
            })
            : Ok(result);
    }

    // ── POST /api/categorias ─────────────────────────────────────────────
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateCategoriaRequest request,
        CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new CreateCategoriaCommand(
            TenantId:    tenantService.TenantId,
            Nombre:      request.Nombre,
            Descripcion: request.Descripcion,
            CreatedBy:   User.Identity?.Name ?? "system"),
            cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    // ── PUT /api/categorias/{id} ─────────────────────────────────────────
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCategoriaRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new UpdateCategoriaCommand(
            CategoriaId: id,
            TenantId:    tenantService.TenantId,
            Nombre:      request.Nombre,
            Descripcion: request.Descripcion,
            IsActivo:    request.IsActivo,
            UpdatedBy:   User.Identity?.Name ?? "system"),
            cancellationToken);

        return NoContent();
    }

    // ── DELETE /api/categorias/{id} ──────────────────────────────────────
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteCategoriaCommand(
            CategoriaId: id,
            TenantId:    tenantService.TenantId,
            DeletedBy:   User.Identity?.Name ?? "system"),
            cancellationToken);

        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CreateCategoriaRequest(string Nombre, string? Descripcion);
public record UpdateCategoriaRequest(string Nombre, string? Descripcion, bool IsActivo);
