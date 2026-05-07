using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Clientes.Commands;
using OPT.Application.Clientes.DTOs;
using OPT.Application.Clientes.Queries;
using OPT.Application.Common;
using OPT.Application.Interfaces;

namespace OPT.API.Controllers;

/// <summary>
/// CRUD de Clientes (Persona y Empresa).
/// Todos los endpoints requieren JWT válido y operan solo sobre
/// los datos del Tenant del usuario autenticado.
/// Las excepciones no controladas son capturadas por ExceptionHandlingMiddleware.
/// </summary>
[ApiController]
[Route("api/Clientes")]
[Authorize]
public class ClienteController(IMediator mediator, ICurrentTenantService tenantService) : ControllerBase
{
    // ── GET /api/cliente ────────────────────────────────────────────────────

    /// <summary>Lista paginada de clientes del tenant autenticado.</summary>
    /// <param name="tipoCliente">Filtro opcional: 'Persona' o 'Empresa'.</param>
    /// <param name="busqueda">Búsqueda por nombre o RUT (parcial).</param>
    /// <param name="page">Página (default: 1).</param>
    /// <param name="pageSize">Tamaño de página (default: 20, máx: 100).</param>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ClienteDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClientes(
        [FromQuery] string? tipoCliente,
        [FromQuery] string? busqueda,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        pageSize = Math.Clamp(pageSize, 1, 100);
        page = Math.Max(1, page);

        var query = new GetClientesQuery(
            tenantService.TenantId, tipoCliente, busqueda, page, pageSize);

        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    // ── GET /api/cliente/{id} ───────────────────────────────────────────────

    /// <summary>Obtiene el detalle de un cliente por ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ClienteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCliente(
        int id, CancellationToken cancellationToken)
    {
        var query = new GetClienteByIdQuery(id, tenantService.TenantId);
        var cliente = await mediator.Send(query, cancellationToken);

        return cliente is null
            ? NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Recurso no encontrado",
                Detail = $"Cliente {id} no encontrado.",
                Instance = HttpContext.Request.Path
            })
            : Ok(cliente);
    }

    // ── POST /api/cliente ───────────────────────────────────────────────────

    /// <summary>Crea un nuevo cliente (Persona o Empresa).</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateCliente(
        [FromBody] CreateClienteRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateClienteCommand(
            TenantId: tenantService.TenantId,
            TipoCliente: request.TipoCliente,
            NumeroDocumento: request.NumeroDocumento,
            Nombre: request.Nombre,
            Direccion: request.Direccion,
            IdComuna: request.IdComuna,
            Celular: request.Celular,
            Mail: request.Mail,
            FechaNacimiento: request.FechaNacimiento,
            TipoPrevision: request.TipoPrevision,
            Giro: request.Giro,
            Contactos: request.Contactos,
            CreatedBy: tenantService.RutUsuario);

        var clienteId = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetCliente), new { id = clienteId }, new { clienteId });
    }

    // ── PUT /api/cliente/{id} ───────────────────────────────────────────────

    /// <summary>Actualiza datos de un cliente existente.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCliente(
        int id,
        [FromBody] UpdateClienteRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateClienteCommand(
            ClienteId: id,
            TenantId: tenantService.TenantId,
            Nombre: request.Nombre,
            Direccion: request.Direccion,
            IdComuna: request.IdComuna,
            Celular: request.Celular,
            Mail: request.Mail,
            FechaNacimiento: request.FechaNacimiento,
            TipoPrevision: request.TipoPrevision,
            Giro: request.Giro,
            Contactos: request.Contactos,
            UpdatedBy: tenantService.RutUsuario);

        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    // ── DELETE /api/cliente/{id} ────────────────────────────────────────────

    /// <summary>Elimina lógicamente un cliente (IsDeleted = true).</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Operador")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCliente(
        int id, CancellationToken cancellationToken)
    {
        var command = new DeleteClienteCommand(id, tenantService.TenantId, tenantService.RutUsuario);
        await mediator.Send(command, cancellationToken);
        return NoContent();
    }
}

// ── Request DTOs ────────────────────────────────────────────────────────────

/// <summary>Datos para crear un cliente.</summary>
public record CreateClienteRequest(
    string TipoCliente,
    string NumeroDocumento,
    string Nombre,
    string? Direccion,
    int? IdComuna,
    string? Celular,
    string? Mail,
    DateOnly? FechaNacimiento,
    string? TipoPrevision,
    string? Giro,
    IReadOnlyList<ContactoInputDto>? Contactos);

/// <summary>Datos actualizables de un cliente (TipoCliente y NumeroDocumento son inmutables).</summary>
public record UpdateClienteRequest(
    string Nombre,
    string? Direccion,
    int? IdComuna,
    string? Celular,
    string? Mail,
    DateOnly? FechaNacimiento,
    string? TipoPrevision,
    string? Giro,
    IReadOnlyList<ContactoInputDto>? Contactos);
