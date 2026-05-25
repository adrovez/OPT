using StockEntity = OPT.Domain.Entities.Stock;
using MovimientoStock = OPT.Domain.Entities.MovimientoStock;

namespace OPT.Application.Interfaces;

public interface IStockRepository
{
    Task<IReadOnlyList<StockEntity>> GetStockBySucursalAsync(Guid tenantId, Guid sucursalId, CancellationToken ct = default);
    Task<StockEntity?> GetStockByVarianteAsync(Guid tenantId, Guid sucursalId, Guid varianteId, CancellationToken ct = default);
    Task<IReadOnlyList<MovimientoStock>> GetHistorialAsync(
        Guid tenantId, Guid sucursalId,
        DateTime? desde, DateTime? hasta, string? tipoMovimiento,
        CancellationToken ct = default);
    Task<Guid> RegistrarMovimientoAsync(
        Guid tenantId, Guid sucursalId, Guid varianteId, Guid usuarioId,
        string tipoMovimiento, int cantidad, string? referencia, string? observacion,
        string createdBy, CancellationToken ct = default);
}
