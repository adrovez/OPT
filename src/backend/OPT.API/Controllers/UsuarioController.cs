using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Interfaces;
using OPT.Application.Usuarios.Commands;
using OPT.Application.Usuarios.DTOs;
using OPT.Application.Usuarios.Queries;

namespace OPT.API.Controllers;

/// <summary>
/// Gestión de Usuarios del tenant autenticado.
/// Todos los endpoints requieren JWT válido y operan solo sobre el Tenant del token.
/// Las excepciones no controladas son capturadas por ExceptionHandlingMiddleware.
/// </summary>
[ApiController]
[Route("api/usuarios")]
[Authorize]
public class UsuarioController(IMediator mediator, ICurrentTenantService tenantService)
    : ControllerBase
{
    // ── GET /api/usuarios ────────────────────────────────────────────────

    /// <summary>Lista todos los usuarios activos del tenant, con sus sucursales asignadas.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<UsuarioDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var query = new GetUsuariosQuery(tenantService.TenantId);
        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    // ── GET /api/usuarios/{id} ───────────────────────────────────────────

    /// <summary>Obtiene el detalle de un usuario por ID, incluyendo sucursales asignadas.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UsuarioDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetUsuarioByIdQuery(id, tenantService.TenantId);
        var result = await mediator.Send(query, cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status   = 404,
                Title    = "Recurso no encontrado",
                Detail   = $"Usuario {id} no encontrado.",
                Instance = HttpContext.Request.Path
            })
            : Ok(result);
    }

    // ── POST /api/usuarios ───────────────────────────────────────────────

    /// <summary>Crea un nuevo usuario en el tenant. La contraseña se hashea con BCrypt.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var createdBy = User.Identity?.Name ?? "system";

        var command = new CreateUsuarioCommand(
            TenantId:   tenantService.TenantId,
            RutUsuario: request.RutUsuario,
            Nombre:     request.Nombre,
            Email:      request.Email,
            Password:   request.Password,
            Rol:        request.Rol,
            CreatedBy:  createdBy);

        var id = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    // ── PUT /api/usuarios/{id} ───────────────────────────────────────────

    /// <summary>Actualiza datos del usuario (sin modificar contraseña ni RUT).</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var updatedBy = User.Identity?.Name ?? "system";

        var command = new UpdateUsuarioCommand(
            UsuarioId:  id,
            TenantId:   tenantService.TenantId,
            Nombre:     request.Nombre,
            Email:      request.Email,
            Rol:        request.Rol,
            UpdatedBy:  updatedBy);

        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    // ── DELETE /api/usuarios/{id} ────────────────────────────────────────

    /// <summary>Elimina lógicamente un usuario (IsDeleted = true).</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deletedBy = User.Identity?.Name ?? "system";
        var command   = new DeleteUsuarioCommand(id, tenantService.TenantId, deletedBy);
        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    // ── PUT /api/usuarios/{id}/password ──────────────────────────────────

    /// <summary>Cambia la contraseña de un usuario. Solo acepta la nueva contraseña en texto plano.</summary>
    [HttpPut("{id:guid}/password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangePassword(
        Guid id,
        [FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        if (id != tenantService.UsuarioId && !User.IsInRole("Admin"))
            return Forbid();

        var updatedBy = User.Identity?.Name ?? "system";

        var command = new ChangePasswordCommand(
            UsuarioId:   id,
            TenantId:    tenantService.TenantId,
            NewPassword: request.NewPassword,
            UpdatedBy:   updatedBy);

        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    // ── POST /api/usuarios/{id}/sucursales ───────────────────────────────

    /// <summary>Asigna una sucursal al usuario. Retorna 409 si ya estaba asignada.</summary>
    [HttpPost("{id:guid}/sucursales")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AssignSucursal(
        Guid id,
        [FromBody] SucursalAsignacionRequest request,
        CancellationToken cancellationToken)
    {
        var assignedBy = User.Identity?.Name ?? "system";

        var command = new AssignSucursalCommand(
            UsuarioId:  id,
            TenantId:   tenantService.TenantId,
            SucursalId: request.SucursalId,
            AssignedBy: assignedBy);

        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    // ── DELETE /api/usuarios/{id}/sucursales/{sucursalId} ────────────────

    /// <summary>Desasigna una sucursal del usuario.</summary>
    [HttpDelete("{id:guid}/sucursales/{sucursalId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveSucursal(
        Guid id,
        Guid sucursalId,
        CancellationToken cancellationToken)
    {
        var command = new RemoveSucursalCommand(id, tenantService.TenantId, sucursalId);
        await mediator.Send(command, cancellationToken);
        return NoContent();
    }
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

public record CreateUsuarioRequest(
    string RutUsuario,
    string Nombre,
    string Email,
    string Password,
    string Rol);

public record UpdateUsuarioRequest(
    string Nombre,
    string Email,
    string Rol);

public record ChangePasswordRequest(string NewPassword);

public record SucursalAsignacionRequest(Guid SucursalId);
