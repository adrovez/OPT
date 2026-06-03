using OPT.Application.Common;
using StockEntity = OPT.Domain.Entities.Stock;
using MovimientoStock = OPT.Domain.Entities.MovimientoStock;

namespace OPT.Application.Interfaces;

public interface IStockRepository
{
    Task<PagedResult<StockEntity>> GetStockBySucursalAsync(
        Guid tenantId, Guid sucursalId, int page, int pageSize,
        CancellationToken ct = default);

    Task<StockEntity?> GetStockByProductoAsync(
        Guid tenantId, Guid sucursalId, Guid productoId, CancellationToken ct = default);

    Task<IReadOnlyList<MovimientoStock>> GetHistorialAsync(
        Guid tenantId, Guid sucursalId,
        DateTime? desde, DateTime? hasta, string? tipoMovimiento,
        CancellationToken ct = default);

    /// <summary>
    /// Registra un movimiento directo: Salida, Ajuste, Merma o DevolucionProveedor.
    /// Entrada solo se permite desde DocumentoEntrada.
    /// </summary>
    Task<Guid> RegistrarMovimientoDirectoAsync(
        Guid tenantId, Guid sucursalId, Guid productoId, Guid usuarioId,
        string tipoMovimiento, int cantidad, string? referencia, string? observacion,
        string createdBy, CancellationToken ct = default);
}
