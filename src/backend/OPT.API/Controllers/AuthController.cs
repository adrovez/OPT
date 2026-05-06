using MediatR;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Auth;

namespace OPT.API.Controllers;

/// <summary>Autenticación de usuarios por RUT + contraseña.</summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Autentica un usuario y devuelve un token JWT.
    /// </summary>
    /// <remarks>
    /// El <c>TenantId</c> identifica la empresa/óptica a la que pertenece el usuario.
    /// La autenticación se realiza por RUT (ej. "12345678-9") + contraseña.
    /// Las excepciones no controladas son capturadas por ExceptionHandlingMiddleware.
    /// </remarks>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var command = new LoginCommand(request.TenantId, request.Rut, request.Password);
        var response = await mediator.Send(command, cancellationToken);
        return Ok(response);
    }
}

/// <summary>Cuerpo del request de login.</summary>
public record LoginRequest(int TenantId, string Rut, string Password);
