using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Contactos.Commands;
using OPT.Application.Contactos.DTOs;
using OPT.Application.Contactos.Queries;
using OPT.Application.Interfaces;

namespace OPT.API.Controllers;

/// <summary>
/// CRUD de Contactos asociados a clientes Empresa.
/// Todos los endpoints requieren JWT válido y operan solo sobre
/// los datos del Tenant del usuario autenticado.
/// </summary>
[ApiController]
[Route("api/Clientes/{clienteId:int}/Contactos")]
[Authorize]
public class ContactoController(IMediator mediator, ICurrentTenantService tenantService)
    : ControllerBase
{
    // ── GET /api/Clientes/{clienteId}/Contactos ─────────────────────────────

    /// <summary>Lista todos los contactos activos de un cliente Empresa.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ContactoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetContactos(
        int clienteId, CancellationToken cancellationToken)
    {
        var query = new GetContactosByClienteQuery(clienteId, tenantService.TenantId);
        var contactos = await mediator.Send(query, cancellationToken);
        return Ok(contactos);
    }

    // ── GET /api/Clientes/{clienteId}/Contactos/{id} ────────────────────────

    /// <summary>Obtiene el detalle de un contacto por ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ContactoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetContacto(
        int clienteId, int id, CancellationToken cancellationToken)
    {
        var query = new GetContactoByIdQuery(id, tenantService.TenantId);
        var contacto = await mediator.Send(query, cancellationToken);

        return contacto is null
            ? NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Recurso no encontrado",
                Detail = $"Contacto {id} no encontrado.",
                Instance = HttpContext.Request.Path
            })
            : Ok(contacto);
    }

    // ── POST /api/Clientes/{clienteId}/Contactos ────────────────────────────

    /// <summary>Agrega un nuevo contacto a un cliente Empresa.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateContacto(
        int clienteId,
        [FromBody] CreateContactoRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateContactoCommand(
            TenantId: tenantService.TenantId,
            ClienteId: clienteId,
            Nombre: request.Nombre,
            Email: request.Email,
            Telefono: request.Telefono,
            Cargo: request.Cargo,
            CreatedBy: tenantService.RutUsuario);

        var contactoId = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(
            nameof(GetContacto),
            new { clienteId, id = contactoId },
            new { contactoId });
    }

    // ── PUT /api/Clientes/{clienteId}/Contactos/{id} ────────────────────────

    /// <summary>Actualiza los datos de un contacto existente.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateContacto(
        int clienteId,
        int id,
        [FromBody] UpdateContactoRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateContactoCommand(
            ContactoId: id,
            TenantId: tenantService.TenantId,
            Nombre: request.Nombre,
            Email: request.Email,
            Telefono: request.Telefono,
            Cargo: request.Cargo,
            Activo: request.Activo,
            UpdatedBy: tenantService.RutUsuario);

        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    // ── DELETE /api/Clientes/{clienteId}/Contactos/{id} ─────────────────────

    /// <summary>Elimina lógicamente un contacto (IsDeleted = true).</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Operador")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteContacto(
        int clienteId,
        int id,
        CancellationToken cancellationToken)
    {
        var command = new DeleteContactoCommand(id, tenantService.TenantId, tenantService.RutUsuario);
        await mediator.Send(command, cancellationToken);
        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

/// <summary>Datos para crear un contacto.</summary>
public record CreateContactoRequest(
    string Nombre,
    string? Email,
    string? Telefono,
    string? Cargo);

/// <summary>Datos actualizables de un contacto.</summary>
public record UpdateContactoRequest(
    string Nombre,
    string? Email,
    string? Telefono,
    string? Cargo,
    bool Activo);
