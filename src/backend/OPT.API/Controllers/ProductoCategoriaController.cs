using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Interfaces;
using OPT.Application.Productos.Commands;
using OPT.Application.Productos.DTOs;
using OPT.Application.Productos.Queries;

namespace OPT.API.Controllers;

[ApiController]
[Route("api/categorias-producto")]
[Authorize]
public class ProductoCategoriaController(IMediator mediator, ICurrentTenantService tenantService)
    : ControllerBase
{
    // ── GET /api/categorias-producto ─────────────────────────────────────

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProductoCategoriaDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetCategoriasQuery(tenantService.TenantId), cancellationToken);
        return Ok(result);
    }

    // ── POST /api/categorias-producto ────────────────────────────────────

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductoCategoriaRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateProductoCategoriaCommand(
            TenantId: tenantService.TenantId,
            Nombre: request.Nombre,
            CreatedBy: User.Identity?.Name ?? "system");

        var id = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { }, new { id });
    }

    // ── PUT /api/categorias-producto/{id} ────────────────────────────────

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateProductoCategoriaRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateProductoCategoriaCommand(
            CategoriaId: id,
            TenantId: tenantService.TenantId,
            Nombre: request.Nombre,
            UpdatedBy: User.Identity?.Name ?? "system");

        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    // ── DELETE /api/categorias-producto/{id} ─────────────────────────────

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteProductoCategoriaCommand(
            CategoriaId: id,
            TenantId: tenantService.TenantId,
            DeletedBy: User.Identity?.Name ?? "system");

        await mediator.Send(command, cancellationToken);
        return NoContent();
    }
}

public record CreateProductoCategoriaRequest(string Nombre);
public record UpdateProductoCategoriaRequest(string Nombre);
