using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Roles.DTOs;
using OPT.Application.Roles.Queries;

namespace OPT.API.Controllers;

/// <summary>
/// Catálogo de Roles (solo lectura).
/// Valores fijos: Admin, Operador, Lectura.
/// Requiere JWT válido para consumir.
/// </summary>
[ApiController]
[Route("api/roles")]
[Authorize]
public class RolController(IMediator mediator) : ControllerBase
{
    /// <summary>Devuelve todos los roles disponibles ordenados por RolId.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<RolDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoles(CancellationToken cancellationToken)
    {
        var roles = await mediator.Send(new GetRolesQuery(), cancellationToken);
        return Ok(roles);
    }
}
