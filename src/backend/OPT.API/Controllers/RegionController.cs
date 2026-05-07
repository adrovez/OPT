using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Comunas.DTOs;
using OPT.Application.Comunas.Queries;
using OPT.Application.Regiones.DTOs;
using OPT.Application.Regiones.Queries;

namespace OPT.API.Controllers;

/// <summary>
/// Catálogo de Regiones y Comunas (solo lectura).
/// Datos globales compartidos entre tenants.
/// Requiere JWT válido para consumir.
/// </summary>
[ApiController]
[Route("api/Regiones")]
[Authorize]
public class RegionController(IMediator mediator) : ControllerBase
{
    // ── GET /api/Regiones ───────────────────────────────────────────────────

    /// <summary>Devuelve todas las regiones activas ordenadas por nombre.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<RegionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRegiones(CancellationToken cancellationToken)
    {
        var regiones = await mediator.Send(new GetRegionesQuery(), cancellationToken);
        return Ok(regiones);
    }

    // ── GET /api/Regiones/{id} ──────────────────────────────────────────────

    /// <summary>Obtiene el detalle de una región por ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(RegionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRegion(int id, CancellationToken cancellationToken)
    {
        var region = await mediator.Send(new GetRegionByIdQuery(id), cancellationToken);

        return region is null
            ? NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Recurso no encontrado",
                Detail = $"Región {id} no encontrada.",
                Instance = HttpContext.Request.Path
            })
            : Ok(region);
    }

    // ── GET /api/Regiones/{id}/Comunas ─────────────────────────────────────

    /// <summary>Devuelve todas las comunas activas de una región, ordenadas por nombre.</summary>
    [HttpGet("{id:int}/Comunas")]
    [ProducesResponseType(typeof(IReadOnlyList<ComunaDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetComunasByRegion(int id, CancellationToken cancellationToken)
    {
        var comunas = await mediator.Send(new GetComunasByRegionQuery(id), cancellationToken);
        return Ok(comunas);
    }

    // ── GET /api/Regiones/Comunas/{comunaId} ────────────────────────────────

    /// <summary>Obtiene el detalle de una comuna por su ID.</summary>
    [HttpGet("Comunas/{comunaId:int}")]
    [ProducesResponseType(typeof(ComunaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetComuna(int comunaId, CancellationToken cancellationToken)
    {
        var comuna = await mediator.Send(new GetComunaByIdQuery(comunaId), cancellationToken);

        return comuna is null
            ? NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Recurso no encontrado",
                Detail = $"Comuna {comunaId} no encontrada.",
                Instance = HttpContext.Request.Path
            })
            : Ok(comuna);
    }
}
