using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

public interface IProductoVarianteRepository
{
    Task<IReadOnlyList<ProductoVariante>> GetByProductoAsync(Guid productoId, Guid tenantId, CancellationToken cancellationToken = default);
    Task<ProductoVariante?> GetByIdAsync(Guid varianteId, Guid tenantId, CancellationToken cancellationToken = default);

    Task<bool> ExisteCodigoBorrasAsync(
        string codigo, Guid tenantId, Guid? excludeVarianteId = null, CancellationToken cancellationToken = default);

    Task<ProductoVariante> AddAsync(ProductoVariante variante, CancellationToken cancellationToken = default);
    Task UpdateAsync(ProductoVariante variante, CancellationToken cancellationToken = default);
    Task SoftDeleteAsync(Guid varianteId, Guid tenantId, string deletedBy, CancellationToken cancellationToken = default);
}
