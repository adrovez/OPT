using OPT.Application.Common;
using DocumentoEntradaEntity = OPT.Domain.Entities.DocumentoEntrada;

namespace OPT.Application.Interfaces;

public record DocumentoEntradaLineaInput(Guid ProductoId, int Cantidad, decimal? PrecioCosto, string? Observaciones = null);

public interface IDocumentoEntradaRepository
{
    Task<PagedResult<DocumentoEntradaEntity>> GetPagedAsync(
        Guid tenantId,
        Guid sucursalId,
        string? estado,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<DocumentoEntradaEntity?> GetByIdAsync(
        Guid tenantId, Guid documentoId, CancellationToken ct = default);

    /// <summary>Crea el documento en estado Borrador.</summary>
    Task<Guid> CrearBorradorAsync(
        Guid tenantId,
        Guid sucursalId,
        string tipoDocumento,
        string? numeroDocumento,
        DateOnly fechaDocumento,
        string? proveedorNombre,
        string? proveedorRut,
        string? observaciones,
        IReadOnlyList<DocumentoEntradaLineaInput> lineas,
        string createdBy,
        CancellationToken ct = default);

    /// <summary>
    /// Confirma el documento: genera MovimientosStock(Entrada) y actualiza PrecioProducto.
    /// Solo puede confirmar si Estado == Borrador.
    /// </summary>
    Task ConfirmarAsync(
        Guid tenantId,
        Guid documentoId,
        Guid usuarioId,
        string updatedBy,
        CancellationToken ct = default);

    /// <summary>
    /// Anula el documento: genera movimientos compensatorios.
    /// Solo puede anular si Estado == Confirmado.
    /// </summary>
    Task AnularAsync(
        Guid tenantId,
        Guid documentoId,
        Guid usuarioId,
        string updatedBy,
        CancellationToken ct = default);
}
