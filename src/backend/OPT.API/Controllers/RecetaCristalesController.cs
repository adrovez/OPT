using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Interfaces;
using OPT.Application.RecetaCristales.Commands;
using OPT.Application.RecetaCristales.DTOs;
using OPT.Application.RecetaCristales.Queries;

namespace OPT.API.Controllers;

/// <summary>
/// CRUD de RecetaCristales (receta óptica por cliente).
/// Todos los endpoints requieren JWT válido y operan solo sobre
/// los datos del Tenant del usuario autenticado.
/// Las excepciones no controladas son capturadas por ExceptionHandlingMiddleware.
/// </summary>
[ApiController]
[Route("api/RecetaCristales")]
[Authorize]
public class RecetaCristalesController(IMediator mediator, ICurrentTenantService tenantService)
    : ControllerBase
{
    // ── GET /api/RecetaCristales?clienteId={id} ──────────────────────────

    /// <summary>Lista todas las recetas activas de un cliente del tenant autenticado.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<RecetaCristalesDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetByCliente(
        [FromQuery] Guid clienteId,
        CancellationToken cancellationToken)
    {
        var query = new GetRecetasByClienteQuery(clienteId, tenantService.TenantId);
        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    // ── GET /api/RecetaCristales/{id} ────────────────────────────────────

    /// <summary>Obtiene el detalle de una receta por ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(RecetaCristalesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetRecetaByIdQuery(id, tenantService.TenantId);
        var result = await mediator.Send(query, cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Recurso no encontrado",
                Detail = $"RecetaCristales {id} no encontrada.",
                Instance = HttpContext.Request.Path
            })
            : Ok(result);
    }

    // ── POST /api/RecetaCristales ────────────────────────────────────────

    /// <summary>Registra una nueva receta de cristales para un cliente.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateRecetaCristalesRequest request,
        CancellationToken cancellationToken)
    {
        var createdBy = User.Identity?.Name ?? "system";

        var command = new CreateRecetaCristalesCommand(
            TenantId: tenantService.TenantId,
            ClienteId: request.ClienteId,
            LejosODEsferico: request.LejosODEsferico,
            LejosODCilindro: request.LejosODCilindro,
            LejosODEje: request.LejosODEje,
            LejosODObservacion: request.LejosODObservacion,
            LejosOIEsferico: request.LejosOIEsferico,
            LejosOICilindro: request.LejosOICilindro,
            LejosOIEje: request.LejosOIEje,
            LejosOIObservacion: request.LejosOIObservacion,
            LejosDPEsferico: request.LejosDPEsferico,
            LejosDPObservacion: request.LejosDPObservacion,
            CercaODEsferico: request.CercaODEsferico,
            CercaODCilindro: request.CercaODCilindro,
            CercaODEje: request.CercaODEje,
            CercaODObservacion: request.CercaODObservacion,
            CercaOIEsferico: request.CercaOIEsferico,
            CercaOICilindro: request.CercaOICilindro,
            CercaOIEje: request.CercaOIEje,
            CercaOIObservacion: request.CercaOIObservacion,
            CercaDPEsferico: request.CercaDPEsferico,
            CercaDPObservacion: request.CercaDPObservacion,
            LejosADDEsfera: request.LejosADDEsfera,
            CheckLejos: request.CheckLejos,
            CheckCerca: request.CheckCerca,
            CheckCristalesLaboratorio: request.CheckCristalesLaboratorio,
            CheckUrgente: request.CheckUrgente,
            FechaIngreso: request.FechaIngreso ?? DateTime.UtcNow,
            CreatedBy: createdBy);

        var id = await mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    // ── PUT /api/RecetaCristales/{id} ────────────────────────────────────

    /// <summary>Actualiza los datos de una receta de cristales existente.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateRecetaCristalesRequest request,
        CancellationToken cancellationToken)
    {
        var updatedBy = User.Identity?.Name ?? "system";

        var command = new UpdateRecetaCristalesCommand(
            RecetaCristalesId: id,
            TenantId: tenantService.TenantId,
            LejosODEsferico: request.LejosODEsferico,
            LejosODCilindro: request.LejosODCilindro,
            LejosODEje: request.LejosODEje,
            LejosODObservacion: request.LejosODObservacion,
            LejosOIEsferico: request.LejosOIEsferico,
            LejosOICilindro: request.LejosOICilindro,
            LejosOIEje: request.LejosOIEje,
            LejosOIObservacion: request.LejosOIObservacion,
            LejosDPEsferico: request.LejosDPEsferico,
            LejosDPObservacion: request.LejosDPObservacion,
            CercaODEsferico: request.CercaODEsferico,
            CercaODCilindro: request.CercaODCilindro,
            CercaODEje: request.CercaODEje,
            CercaODObservacion: request.CercaODObservacion,
            CercaOIEsferico: request.CercaOIEsferico,
            CercaOICilindro: request.CercaOICilindro,
            CercaOIEje: request.CercaOIEje,
            CercaOIObservacion: request.CercaOIObservacion,
            CercaDPEsferico: request.CercaDPEsferico,
            CercaDPObservacion: request.CercaDPObservacion,
            LejosADDEsfera: request.LejosADDEsfera,
            CheckLejos: request.CheckLejos,
            CheckCerca: request.CheckCerca,
            CheckCristalesLaboratorio: request.CheckCristalesLaboratorio,
            CheckUrgente: request.CheckUrgente,
            FechaIngreso: request.FechaIngreso,
            UpdatedBy: updatedBy);

        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    // ── DELETE /api/RecetaCristales/{id} ─────────────────────────────────

    /// <summary>Elimina lógicamente una receta (IsDeleted = true).</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deletedBy = User.Identity?.Name ?? "system";

        var command = new DeleteRecetaCristalesCommand(id, tenantService.TenantId, deletedBy);
        await mediator.Send(command, cancellationToken);
        return NoContent();
    }
}

// ── Request DTOs (solo para esta API) ────────────────────────────────────────

/// <summary>Cuerpo del request para crear una receta de cristales.</summary>
public record CreateRecetaCristalesRequest(
    Guid ClienteId,
    string? LejosODEsferico,
    string? LejosODCilindro,
    string? LejosODEje,
    string? LejosODObservacion,
    string? LejosOIEsferico,
    string? LejosOICilindro,
    string? LejosOIEje,
    string? LejosOIObservacion,
    string? LejosDPEsferico,
    string? LejosDPObservacion,
    string? CercaODEsferico,
    string? CercaODCilindro,
    string? CercaODEje,
    string? CercaODObservacion,
    string? CercaOIEsferico,
    string? CercaOICilindro,
    string? CercaOIEje,
    string? CercaOIObservacion,
    string? CercaDPEsferico,
    string? CercaDPObservacion,
    string? LejosADDEsfera,
    bool CheckLejos,
    bool CheckCerca,
    bool CheckCristalesLaboratorio,
    bool CheckUrgente,
    DateTime? FechaIngreso);

/// <summary>Cuerpo del request para actualizar una receta de cristales.</summary>
public record UpdateRecetaCristalesRequest(
    string? LejosODEsferico,
    string? LejosODCilindro,
    string? LejosODEje,
    string? LejosODObservacion,
    string? LejosOIEsferico,
    string? LejosOICilindro,
    string? LejosOIEje,
    string? LejosOIObservacion,
    string? LejosDPEsferico,
    string? LejosDPObservacion,
    string? CercaODEsferico,
    string? CercaODCilindro,
    string? CercaODEje,
    string? CercaODObservacion,
    string? CercaOIEsferico,
    string? CercaOICilindro,
    string? CercaOIEje,
    string? CercaOIObservacion,
    string? CercaDPEsferico,
    string? CercaDPObservacion,
    string? LejosADDEsfera,
    bool CheckLejos,
    bool CheckCerca,
    bool CheckCristalesLaboratorio,
    bool CheckUrgente,
    DateTime FechaIngreso);
