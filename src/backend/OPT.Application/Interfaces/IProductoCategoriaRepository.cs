using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

public interface IProductoCategoriaRepository
{
    Task<IReadOnlyList<ProductoCategoria>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<ProductoCategoria?> GetByIdAsync(Guid categoriaId, Guid tenantId, CancellationToken cancellationToken = default);
    Task<ProductoCategoria> AddAsync(ProductoCategoria categoria, CancellationToken cancellationToken = default);
    Task UpdateAsync(ProductoCategoria categoria, CancellationToken cancellationToken = default);
    Task SoftDeleteAsync(Guid categoriaId, Guid tenantId, string deletedBy, CancellationToken cancellationToken = default);
}
