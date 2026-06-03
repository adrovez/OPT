using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

public interface ICategoriaRepository
{
    Task<IReadOnlyList<Categoria>> GetAllAsync(
        Guid tenantId, bool soloActivas = true, CancellationToken cancellationToken = default);

    Task<Categoria?> GetByIdAsync(
        Guid categoriaId, Guid tenantId, CancellationToken cancellationToken = default);

    Task<Categoria> AddAsync(Categoria categoria, CancellationToken cancellationToken = default);
    Task UpdateAsync(Categoria categoria, CancellationToken cancellationToken = default);

    Task SoftDeleteAsync(
        Guid categoriaId, Guid tenantId, string deletedBy, CancellationToken cancellationToken = default);
}
