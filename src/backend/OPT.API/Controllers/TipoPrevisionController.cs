using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Prevision.DTOs;
using OPT.Application.Prevision.Queries;

namespace OPT.API.Controllers;

/// <summary>
/// Catálogo de Tipos de Previsión de salud (solo lectura).
/// Catálogo compartido sin scope de tenant.
/// Requiere JWT válido para consumir.
/// </summary>
[ApiController]
[Route("api/tipo-previsiones")]
[Authorize]
public class TipoPrevisionController(IMediator mediator) : ControllerBase
{
    /// <summary>Devuelve todos los tipos de previsión ordenados por id.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TipoPrevisionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetTipoPrevisionesQuery(), cancellationToken);
        return Ok(result);
    }
}
