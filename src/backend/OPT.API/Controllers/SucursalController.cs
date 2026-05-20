using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Interfaces;
using OPT.Application.Sucursales.Commands;
using OPT.Application.Sucursales.DTOs;
using OPT.Application.Sucursales.Queries;

namespace OPT.API.Controllers;

/// <summary>
/// CRUD de Sucursales del tenant autenticado.
/// Todos los endpoints requieren JWT válido y operan solo sobre
/// los datos del Tenant del usuario autenticado.
/// Las excepciones no controladas son capturadas por ExceptionHandlingMiddleware.
/// </summary>
[ApiController]
[Route("api/sucursales")]
[Authorize]
public class SucursalController(IMediator mediator, ICurrentTenantService tenantService)
    : ControllerBase
{
    // ── GET /api/sucursales ──────────────────────────────────────────────

    /// <summary>Lista todas las sucursales activas del tenant autenticado.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SucursalDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var query = new GetSucursalesQuery(tenantService.TenantId);
        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    // ── GET /api/sucursales/{id} ─────────────────────────────────────────

    /// <summary>Obtiene el detalle de una sucursal por ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SucursalDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetSucursalByIdQuery(id, tenantService.TenantId);
        var result = await mediator.Send(query, cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Recurso no encontrado",
                Detail = $"Sucursal {id} no encontrada.",
                Instance = HttpContext.Request.Path
            })
            : Ok(result);
    }

    // ── POST /api/sucursales ─────────────────────────────────────────────

    /// <summary>Crea una nueva sucursal para el tenant autenticado.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateSucursalRequest request,
        CancellationToken cancellationToken)
    {
        var createdBy = User.Identity?.Name ?? "system";

        var command = new CreateSucursalCommand(
            TenantId: tenantService.TenantId,
            Nombre: request.Nombre,
            Direccion: request.Direccion,
            Telefono: request.Telefono,
            Matriz: request.Matriz,
            CreatedBy: createdBy);

        var id = await mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    // ── PUT /api/sucursales/{id} ─────────────────────────────────────────

    /// <summary>Actualiza los datos de una sucursal existente.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateSucursalRequest request,
        CancellationToken cancellationToken)
    {
        var updatedBy = User.Identity?.Name ?? "system";

        var command = new UpdateSucursalCommand(
            SucursalId: id,
            TenantId: tenantService.TenantId,
            Nombre: request.Nombre,
            Direccion: request.Direccion,
            Telefono: request.Telefono,
            Matriz: request.Matriz,
            UpdatedBy: updatedBy);

        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    // ── DELETE /api/sucursales/{id} ──────────────────────────────────────

    /// <summary>Elimina lógicamente una sucursal (IsDeleted = true).</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deletedBy = User.Identity?.Name ?? "system";

        var command = new DeleteSucursalCommand(id, tenantService.TenantId, deletedBy);
        await mediator.Send(command, cancellationToken);
        return NoContent();
    }
}

// ── Request DTOs (solo para esta API) ────────────────────────────────────────

/// <summary>Cuerpo del request para crear una sucursal.</summary>
public record CreateSucursalRequest(
    string Nombre,
    string? Direccion,
    string? Telefono,
    bool Matriz);

/// <summary>Cuerpo del request para actualizar una sucursal.</summary>
public record UpdateSucursalRequest(
    string Nombre,
    string? Direccion,
    string? Telefono,
    bool Matriz);
