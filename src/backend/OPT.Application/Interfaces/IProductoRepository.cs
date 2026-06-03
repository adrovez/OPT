using OPT.Application.Common;
using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

public interface IProductoRepository
{
    Task<PagedResult<Producto>> GetPagedAsync(
        Guid tenantId,
        string? tipo,
        Guid? categoriaId,
        bool soloRaices,
        Guid? padreId,
        string? busqueda,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<Producto?> GetByIdAsync(
        Guid productoId, Guid tenantId, CancellationToken cancellationToken = default);

    Task<bool> ExisteCodigoInternoAsync(
        string codigo, Guid tenantId, Guid? excludeProductoId = null,
        CancellationToken cancellationToken = default);

    Task<Producto> AddAsync(Producto producto, CancellationToken cancellationToken = default);
    Task UpdateAsync(Producto producto, CancellationToken cancellationToken = default);

    Task SoftDeleteAsync(
        Guid productoId, Guid tenantId, string deletedBy, CancellationToken cancellationToken = default);
}
