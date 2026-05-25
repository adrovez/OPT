using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OPT.Application.Common;
using OPT.Application.DocumentoStock.Commands;
using OPT.Application.DocumentoStock.DTOs;
using OPT.Application.DocumentoStock.Queries;
using OPT.Application.Interfaces;

namespace OPT.API.Controllers;

/// <summary>
/// Documentos de entrada de stock (FacturaCompra, BoletaCompra, OtroIngreso).
/// Al confirmar un documento se actualizan stock y precio de costo.
/// Requiere JWT válido y header X-Sucursal-Id.
/// </summary>
[ApiController]
[Route("api/documentos-stock")]
[Authorize]
public class DocumentosStockController(
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
        Instance = HttpContext.Request.Path,
    });

    // ── GET /api/documentos-stock ────────────────────────────────────────────

    /// <summary>Lista documentos de stock de la sucursal activa con filtros opcionales.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<DocumentoStockDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDocumentos(
        [FromQuery] string? tipo,
        [FromQuery] string? estado,
        [FromQuery] DateOnly? desde,
        [FromQuery] DateOnly? hasta,
        [FromQuery] int page     = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        return Ok(await mediator.Send(
            new GetDocumentosQuery(
                TenantId:  tenantService.TenantId,
                SucursalId: sucursalId.Value,
                Tipo:      tipo,
                Estado:    estado,
                Desde:     desde,
                Hasta:     hasta,
                Page:      page,
                PageSize:  pageSize),
            cancellationToken));
    }

    // ── GET /api/documentos-stock/{id} ───────────────────────────────────────

    /// <summary>Obtiene un documento con sus líneas.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(DocumentoStockDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetDocumentoByIdQuery(tenantService.TenantId, id),
            cancellationToken);

        return result is null
            ? NotFound(new ProblemDetails
            {
                Status   = 404,
                Title    = "Recurso no encontrado",
                Detail   = $"No se encontró el documento {id}.",
                Instance = HttpContext.Request.Path,
            })
            : Ok(result);
    }

    // ── POST /api/documentos-stock ───────────────────────────────────────────

    /// <summary>
    /// Crea y confirma un documento de entrada. Actualiza stock y precio de costo.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Crear(
        [FromBody] CrearDocumentoRequest request,
        CancellationToken cancellationToken)
    {
        var sucursalId = ParseSucursalHeader();
        if (sucursalId is null) return SucursalRequerida();

        var documentoId = await mediator.Send(new CrearYConfirmarDocumentoCommand(
            TenantId:        tenantService.TenantId,
            SucursalId:      sucursalId.Value,
            UsuarioId:       tenantService.UsuarioId,
            CreatedBy:       tenantService.RutUsuario,
            TipoDocumento:   request.TipoDocumento,
            NumeroDocumento: request.NumeroDocumento,
            Fecha:           request.Fecha,
            ProveedorNombre: request.ProveedorNombre,
            Observacion:     request.Observacion,
            Lineas:          request.Lineas
                .Select(l => new DocumentoLineaInput(l.VarianteId, l.Cantidad, l.PrecioCosto))
                .ToList()),
            cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = documentoId }, new { documentoId });
    }

    // ── POST /api/documentos-stock/{id}/anular ───────────────────────────────

    /// <summary>Anula un documento confirmado. Genera movimientos de compensación.</summary>
    [HttpPost("{id:guid}/anular")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Anular(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new AnularDocumentoCommand(
            TenantId:    tenantService.TenantId,
            DocumentoId: id,
            UsuarioId:   tenantService.UsuarioId,
            UpdatedBy:   tenantService.RutUsuario),
            cancellationToken);

        return NoContent();
    }
}

// ── Request records ───────────────────────────────────────────────────────────

public record CrearDocumentoRequest(
    string TipoDocumento,
    string NumeroDocumento,
    DateOnly Fecha,
    string? ProveedorNombre,
    string? Observacion,
    IReadOnlyList<CrearDocumentoLineaRequest> Lineas);

public record CrearDocumentoLineaRequest(
    Guid VarianteId,
    int Cantidad,
    decimal? PrecioCosto);
