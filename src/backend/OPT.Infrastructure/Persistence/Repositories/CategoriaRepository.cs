using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

public class CategoriaRepository(OPTDbContext context) : ICategoriaRepository
{
    public async Task<IReadOnlyList<Categoria>> GetAllAsync(
        Guid tenantId, bool soloActivas = true, CancellationToken cancellationToken = default)
    {
        var query = context.Categorias.Where(c => c.TenantId == tenantId);
        if (soloActivas) query = query.Where(c => c.IsActivo);
        return await query.OrderBy(c => c.Nombre).ToListAsync(cancellationToken);
    }

    public async Task<Categoria?> GetByIdAsync(
        Guid categoriaId, Guid tenantId, CancellationToken cancellationToken = default)
        => await context.Categorias
            .FirstOrDefaultAsync(
                c => c.CategoriaId == categoriaId && c.TenantId == tenantId,
                cancellationToken);

    public async Task<Categoria> AddAsync(
        Categoria categoria, CancellationToken cancellationToken = default)
    {
        context.Categorias.Add(categoria);
        await context.SaveChangesAsync(cancellationToken);
        return categoria;
    }

    public async Task UpdateAsync(
        Categoria categoria, CancellationToken cancellationToken = default)
    {
        context.Categorias.Update(categoria);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task SoftDeleteAsync(
        Guid categoriaId, Guid tenantId, string deletedBy, CancellationToken cancellationToken = default)
    {
        var categoria = await context.Categorias
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
