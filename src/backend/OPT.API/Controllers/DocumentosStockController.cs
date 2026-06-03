using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Common;
using OPT.Application.DocumentoEntrada.Commands;
using OPT.Application.DocumentoEntrada.DTOs;
using OPT.Application.DocumentoEntrada.Queries;
using OPT.Application.Interfaces;

namespace OPT.API.Controllers;

/// <summary>
/// Documentos de entrada de stock (FacturaCompra, BoletaCompra, GuiaDespacho, OtroIngreso).
/// Flujo: Crear (Borrador) → PATCH estado (Confirmado) → actualiza stock y precio de costo.
/// Requiere JWT válido y header X-Sucursal-Id.
/// </summary>
[ApiController]
[Route("api/documentos-entrada")]
[Authorize]
public class DocumentoEntradaController(
    IMediator mediator,
    ICurrentTenantService tenantService) : ControllerBase
{
    private Guid? ParseSucursalHeader()
    {
        var header = Request.Headers["X-Sucursal-Id"].FirstOrDefault();
        return Guid.TryParse(header, out var id) ? id : null;
    }

    private IActionResult SucursalRequerida() => BadRequest(new ProblemDetails
    {
        Status   = 400,
        Title    = "Header requerido",
        Detail   = "El header 'X-Sucursal-Id' es obligatorio y debe ser un GUID válido.",
        Instance = HttpContext.Request.Path
    });

    // ── GET /api/documentos-entrada ──────────────────────────────────────────
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<DocumentoEntradaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDocumentos(
        [FromQuery] string? estado,
        [FromQuery] int page     = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        return Ok(await mediator.Send(
            new GetDocumentosEntradaQuery(
                TenantId:   tenantService.TenantId,
                SucursalId: sucursalId.Value,
                Estado:     estado,
                Page:       page,
                PageSize:   pageSize),
            cancellationToken));
    }

    // ── GET /api/documentos-entrada/{id} ────────────────────────────────────
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(DocumentoEntradaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetDocumentoEntradaByIdQuery(tenantService.TenantId, id),
            cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status   = 404,
                Title    = "Recurso no encontrado",
                Detail   = $"No se encontró el documento {id}.",
                Instance = HttpContext.Request.Path
            })
            : Ok(result);
    }

    // ── POST /api/documentos-entrada ─────────────────────────────────────────
    /// <summary>Crea el documento en estado Borrador.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Crear(
        [FromBody] CrearDocumentoEntradaRequest request,
        CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        var documentoId = await mediator.Send(new CrearDocumentoEntradaCommand(
            TenantId:        tenantService.TenantId,
            SucursalId:      sucursalId.Value,
            TipoDocumento:   request.TipoDocumento,
            NumeroDocumento: request.NumeroDocumento,
            FechaDocumento:  request.FechaDocumento,
            ProveedorNombre: request.ProveedorNombre,
            ProveedorRut:    request.ProveedorRut,
            Observaciones:   request.Observaciones,
            Lineas:          request.Lineas
                .Select(l => new DocumentoEntradaLineaInput(
                    l.ProductoId, l.Cantidad, l.PrecioCosto, l.Observaciones))
                .ToList(),
            CreatedBy: tenantService.RutUsuario),
            cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = documentoId }, new { documentoId });
    }

    // ── PATCH /api/documentos-entrada/{id}/estado ────────────────────────────
    /// <summary>
    /// Transición de estado.
    /// Confirmar: genera MovimientosStock(Entrada) + actualiza PrecioProducto.
    /// Anular: genera movimientos compensatorios (solo si Confirmado).
    /// </summary>
    [HttpPatch("{id:guid}/estado")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CambiarEstado(
        Guid id,
        [FromBody] CambiarEstadoDocumentoRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new CambiarEstadoDocumentoEntradaCommand(
            TenantId:    tenantService.TenantId,
            DocumentoId: id,
            Estado:      request.Estado,
            UsuarioId:   tenantService.UsuarioId,
            UpdatedBy:   tenantService.RutUsuario),
            cancellationToken);

        return NoContent();
    }
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

public record CrearDocumentoEntradaRequest(
    string TipoDocumento,
    string? NumeroDocumento,
    DateOnly FechaDocumento,
    string? ProveedorNombre,
    string? ProveedorRut,
    string? Observaciones,
    IReadOnlyList<CrearDocumentoEntradaLineaRequest> Lineas);

public record CrearDocumentoEntradaLineaRequest(
    Guid ProductoId,
    int Cantidad,
    decimal? PrecioCosto,
    string? Observaciones);

public record CambiarEstadoDocumentoRequest(string Estado);
