using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

public class ProductoVarianteRepository(OPTDbContext context) : IProductoVarianteRepository
{
    public async Task<IReadOnlyList<ProductoVariante>> GetByProductoAsync(
        Guid productoId, Guid tenantId, CancellationToken cancellationToken = default)
        => await context.ProductoVariantes
            .Where(v => v.ProductoId == productoId && v.TenantId == tenantId)
            .OrderBy(v => v.Nombre)
            .ToListAsync(cancellationToken);

    public async Task<ProductoVariante?> GetByIdAsync(
        Guid varianteId, Guid tenantId, CancellationToken cancellationToken = default)
        => await context.ProductoVariantes
            .FirstOrDefaultAsync(
                v => v.VarianteId == varianteId && v.TenantId == tenantId,
                cancellationToken);

    public async Task<bool> ExisteCodigoBorrasAsync(
        string codigo, Guid tenantId, Guid? excludeVarianteId = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.ProductoVariantes
            .Where(v => v.TenantId == tenantId && v.CodigoBarras == codigo);

        if (excludeVarianteId.HasValue)
            query = query.Where(v => v.VarianteId != excludeVarianteId.Value);

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<ProductoVariante> AddAsync(
        ProductoVariante variante, CancellationToken cancellationToken = default)
    {
        context.ProductoVariantes.Add(variante);
        await context.SaveChangesAsync(cancellationToken);
        return variante;
    }

    public async Task UpdateAsync(
        ProductoVariante variante, CancellationToken cancellationToken = default)
    {
        context.ProductoVariantes.Update(variante);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task SoftDeleteAsync(
        Guid varianteId, Guid tenantId, string deletedBy,
        CancellationToken cancellationToken = default)
    {
        var variante = await context.ProductoVariantes
            .FirstOrDefaultAsync(
                v => v.VarianteId == varianteId && v.TenantId == tenantId,
                cancellationToken)
            ?? throw new KeyNotFoundException($"Variante {varianteId} no encontrada.");

        variante.IsDeleted = true;
        variante.UpdatedAt = DateTime.UtcNow;
        variante.UpdatedBy = deletedBy;

        await context.SaveChangesAsync(cancellationToken);
    }
}
