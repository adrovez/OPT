using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.FormaPago.DTOs;
using OPT.Application.FormaPago.Queries;

namespace OPT.API.Controllers;

/// <summary>Catálogo de Formas de Pago. Solo lectura.</summary>
[ApiController]
[Route("api/forma-pagos")]
[Authorize]
public class FormaPagosController(IMediator mediator) : ControllerBase
{
    /// <summary>Devuelve todas las formas de pago disponibles.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<FormaPagoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => Ok(await mediator.Send(new GetFormaPagosQuery(), cancellationToken));
}
