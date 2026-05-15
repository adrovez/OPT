using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repositorio de RecetaCristales sobre SQL Server vía EF Core.
/// Todas las consultas incluyen TenantId para garantizar aislamiento multi-tenant.
/// El QueryFilter global en OPTDbContext ya excluye IsDeleted = true.
/// </summary>
public class RecetaCristalesRepository(OPTDbContext context) : IRecetaCristalesRepository
{
    public async Task<IReadOnlyList<RecetaCristales>> GetByClienteAsync(
        Guid clienteId, Guid tenantId, CancellationToken cancellationToken = default)
        => await context.RecetasCristales
            .Where(r => r.ClienteId == clienteId && r.TenantId == tenantId)
            .OrderByDescending(r => r.FechaIngreso)
            .ToListAsync(cancellationToken);

    public async Task<RecetaCristales?> GetByIdAsync(
        Guid recetaId, Guid tenantId, CancellationToken cancellationToken = default)
        => await context.RecetasCristales
            .FirstOrDefaultAsync(
                r => r.RecetaCristalesId == recetaId && r.TenantId == tenantId,
                cancellationToken);

    public async Task<RecetaCristales> AddAsync(
        RecetaCristales receta, CancellationToken cancellationToken = default)
    {
        context.RecetasCristales.Add(receta);
        await context.SaveChangesAsync(cancellationToken);
        return receta;
    }

    public async Task UpdateAsync(
        RecetaCristales receta, CancellationToken cancellationToken = default)
    {
        context.RecetasCristales.Update(receta);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task SoftDeleteAsync(
        Guid recetaId, Guid tenantId, string deletedBy,
        CancellationToken cancellationToken = default)
    {
        var receta = await context.RecetasCristales
            .FirstOrDefaultAsync(
                r => r.RecetaCristalesId == recetaId && r.TenantId == tenantId,
                cancellationToken)
            ?? throw new KeyNotFoundException($"RecetaCristales {recetaId} no encontrada.");

        receta.IsDeleted = true;
        receta.UpdatedAt = DateTime.UtcNow;
        receta.UpdatedBy = deletedBy;

        await context.SaveChangesAsync(cancellationToken);
    }
}
