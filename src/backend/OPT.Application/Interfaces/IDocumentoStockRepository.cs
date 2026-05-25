using DocumentoStockEntity = OPT.Domain.Entities.DocumentoStock;

namespace OPT.Application.Interfaces;

public record DocumentoLineaInput(Guid VarianteId, int Cantidad, decimal? PrecioCosto);

public interface IDocumentoStockRepository
{
    Task<IReadOnlyList<DocumentoStockEntity>> GetDocumentosAsync(
        Guid tenantId,
        Guid sucursalId,
        string? tipo,
        string? estado,
        DateOnly? desde,
        DateOnly? hasta,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<int> GetDocumentosCountAsync(
        Guid tenantId,
        Guid sucursalId,
        string? tipo,
        string? estado,
        DateOnly? desde,
        DateOnly? hasta,
        CancellationToken ct = default);

    Task<DocumentoStockEntity?> GetDocumentoByIdAsync(
        Guid tenantId,
        Guid documentoId,
        CancellationToken ct = default);

    Task<Guid> CrearYConfirmarAsync(
        Guid tenantId,
        Guid sucursalId,
        Guid usuarioId,
        string tipoDocumento,
        string numeroDocumento,
        DateOnly fecha,
        string? proveedorNombre,
        string? observacion,
        IReadOnlyList<DocumentoLineaInput> lineas,
        string createdBy,
        CancellationToken ct = default);

    Task AnularAsync(
        Guid tenantId,
        Guid documentoId,
        Guid usuarioId,
        string updatedBy,
        CancellationToken ct = default);
}
