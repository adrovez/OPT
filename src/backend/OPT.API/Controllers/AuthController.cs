using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OPT.Application.Auth;

namespace OPT.API.Controllers;

/// <summary>Autenticación de usuarios por RUT + contraseña, refresh y logout.</summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Autentica un usuario y devuelve un token JWT más un refresh token.
    /// </summary>
    /// <remarks>
    /// El <c>TenantId</c> identifica la empresa/óptica a la que pertenece el usuario.
    /// La autenticación se realiza por RUT (ej. "12345678-9") + contraseña.
    /// Las excepciones no controladas son capturadas por ExceptionHandlingMiddleware.
    /// </remarks>
    [HttpPost("login")]
    [EnableRateLimiting("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var command = new LoginCommand(request.TenantId, request.Rut, request.Password);
        var response = await mediator.Send(command, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Rota el par JWT + refresh token. Devuelve un nuevo par si el refresh token es válido.
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshRequest request,
        CancellationToken cancellationToken)
    {
        var command = new RefreshTokenCommand(request.RefreshToken, request.TenantId);
        var response = await mediator.Send(command, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Revoca el refresh token del usuario autenticado (logout).
    /// El TenantId se extrae del JWT, no del body.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout(
        [FromBody] LogoutRequest request,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue("tenant_id"), out var tenantId))
            return Unauthorized();

        await mediator.Send(new LogoutCommand(request.RefreshToken, tenantId), cancellationToken);
        return NoContent();
    }
}

/// <summary>Cuerpo del request de login.</summary>
public record LoginRequest(Guid TenantId, string Rut, string Password);

/// <summary>Cuerpo del request de refresh.</summary>
public record RefreshRequest(string RefreshToken, Guid TenantId);

/// <summary>Cuerpo del request de logout.</summary>
public record LogoutRequest(string RefreshToken);
