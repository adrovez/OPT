using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

public class ProductoCategoriaRepository(OPTDbContext context) : IProductoCategoriaRepository
{
    public async Task<IReadOnlyList<ProductoCategoria>> GetAllAsync(
        Guid tenantId, CancellationToken cancellationToken = default)
        => await context.ProductoCategorias
            .Where(c => c.TenantId == tenantId)
            .OrderBy(c => c.Nombre)
            .ToListAsync(cancellationToken);

    public async Task<ProductoCategoria?> GetByIdAsync(
        Guid categoriaId, Guid tenantId, CancellationToken cancellationToken = default)
        => await context.ProductoCategorias
            .FirstOrDefaultAsync(
                c => c.CategoriaId == categoriaId && c.TenantId == tenantId,
                cancellationToken);

    public async Task<ProductoCategoria> AddAsync(
        ProductoCategoria categoria, CancellationToken cancellationToken = default)
    {
        context.ProductoCategorias.Add(categoria);
        await context.SaveChangesAsync(cancellationToken);
        return categoria;
    }

    public async Task UpdateAsync(
        ProductoCategoria categoria, CancellationToken cancellationToken = default)
    {
        context.ProductoCategorias.Update(categoria);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task SoftDeleteAsync(
        Guid categoriaId, Guid tenantId, string deletedBy,
        CancellationToken cancellationToken = default)
    {
        var categoria = await context.ProductoCategorias
            .FirstOrDefaultAsync(
                c => c.CategoriaId == categoriaId && c.TenantId == tenantId,
                cancellationToken)
            ?? throw new KeyNotFoundException($"Categoría {categoriaId} no encontrada.");

        categoria.IsDeleted = true;
        categoria.UpdatedAt = DateTime.UtcNow;
        categoria.UpdatedBy = deletedBy;

        await context.SaveChangesAsync(cancellationToken);
    }
}
