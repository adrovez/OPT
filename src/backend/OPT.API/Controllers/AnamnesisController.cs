using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Anamnesis.Commands;
using OPT.Application.Anamnesis.DTOs;
using OPT.Application.Anamnesis.Queries;
using OPT.Application.Interfaces;

namespace OPT.API.Controllers;

/// <summary>
/// CRUD de Anamnesis (antecedentes de salud por cliente).
/// Todos los endpoints requieren JWT válido y operan solo sobre
/// los datos del Tenant del usuario autenticado.
/// Las excepciones no controladas son capturadas por ExceptionHandlingMiddleware.
/// </summary>
[ApiController]
[Route("api/Anamnesis")]
[Authorize]
public class AnamnesisController(IMediator mediator, ICurrentTenantService tenantService)
    : ControllerBase
{
    // ── GET /api/Anamnesis?clienteId={id} ────────────────────────────────

    /// <summary>Lista todas las anamnesis activas de un cliente del tenant autenticado.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AnamnesisDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetByCliente(
        [FromQuery] Guid clienteId,
        CancellationToken cancellationToken)
    {        var query = new GetAnamnesisByClienteQuery(clienteId, tenantService.TenantId);
        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    // ── GET /api/Anamnesis/{id} ──────────────────────────────────────────

    /// <summary>Obtiene el detalle de una anamnesis por ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AnamnesisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetAnamnesisQuery(id, tenantService.TenantId);
        var result = await mediator.Send(query, cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Recurso no encontrado",
                Detail = $"Anamnesis {id} no encontrada.",
                Instance = HttpContext.Request.Path
            })
            : Ok(result);
    }

    // ── POST /api/Anamnesis ──────────────────────────────────────────────

    /// <summary>Registra una nueva anamnesis para un cliente.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateAnamnesisRequest request,
        CancellationToken cancellationToken)
    {
        var createdBy = User.Identity?.Name ?? "system";

        var command = new CreateAnamnesisCommand(
            TenantId: tenantService.TenantId,
            ClienteId: request.ClienteId,
            Hipertension: request.Hipertension,
            Diabetes: request.Diabetes,
            Alergias: request.Alergias,
            UsaLentes: request.UsaLentes,
            Observacion: request.Observacion,
            CreatedBy: createdBy);

        var id = await mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    // ── PUT /api/Anamnesis/{id} ──────────────────────────────────────────

    /// <summary>Actualiza los antecedentes de una anamnesis existente.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateAnamnesisRequest request,
        CancellationToken cancellationToken)
    {
        var updatedBy = User.Identity?.Name ?? "system";

        var command = new UpdateAnamnesisCommand(
            AnamnesisId: id,
            TenantId: tenantService.TenantId,
            Hipertension: request.Hipertension,
            Diabetes: request.Diabetes,
            Alergias: request.Alergias,
            UsaLentes: request.UsaLentes,
            Observacion: request.Observacion,
            UpdatedBy: updatedBy);

        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    // ── DELETE /api/Anamnesis/{id} ───────────────────────────────────────

    /// <summary>Elimina lógicamente una anamnesis (IsDeleted = true).</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deletedBy = User.Identity?.Name ?? "system";

        var command = new DeleteAnamnesisCommand(id, tenantService.TenantId, deletedBy);
        await mediator.Send(command, cancellationToken);
        return NoContent();
    }
}

// ── Request DTOs (solo para esta API) ────────────────────────────────────────

/// <summary>Cuerpo del request para crear una anamnesis.</summary>
public record CreateAnamnesisRequest(
    Guid ClienteId,
    bool Hipertension,
    bool Diabetes,
    bool Alergias,
    bool UsaLentes,
    string? Observacion);

/// <summary>Cuerpo del request para actualizar una anamnesis.</summary>
public record UpdateAnamnesisRequest(
    bool Hipertension,
    bool Diabetes,
    bool Alergias,
    bool UsaLentes,
    string? Observacion);
