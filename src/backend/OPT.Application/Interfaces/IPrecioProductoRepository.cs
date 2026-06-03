using OPT.Application.Common;
using OPT.Application.Precios.DTOs;
using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

public interface IPrecioProductoRepository
{
    Task<PrecioProducto?> GetVigenteAsync(
        Guid tenantId, Guid productoId, CancellationToken ct = default);

    /// <summary>Lista paginada de precios vigentes de todos los productos del tenant.</summary>
    Task<PagedResult<PrecioProductoDto>> GetVigentesPagedAsync(
        Guid tenantId,
        string? search,
        Guid? categoriaId,
        int page,
        int pageSize,
        CancellationToken ct = default);

    /// <summary>Historial completo de precios de un producto (más reciente primero).</summary>
    Task<IReadOnlyList<PrecioProductoDto>> GetHistorialAsync(
        Guid tenantId, Guid productoId, CancellationToken ct = default);

    /// <summary>Cierra el precio vigente y crea uno nuevo.</summary>
    Task SetPrecioAsync(
        Guid tenantId,
        Guid productoId,
        decimal? precioCosto,
        decimal? precioVenta,
        string createdBy,
        CancellationToken ct = default);
}
