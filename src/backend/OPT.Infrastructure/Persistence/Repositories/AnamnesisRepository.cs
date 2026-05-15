using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repositorio de Anamnesis sobre SQL Server vía EF Core.
/// Todas las consultas incluyen TenantId para garantizar aislamiento multi-tenant.
/// El QueryFilter global en OPTDbContext ya excluye IsDeleted = true.
/// </summary>
public class AnamnesisRepository(OPTDbContext context) : IAnamnesisRepository
{
    public async Task<IReadOnlyList<Anamnesis>> GetByClienteAsync(
        Guid clienteId, Guid tenantId, CancellationToken cancellationToken = default)
        => await context.Anamnesis
            .Where(a => a.ClienteId == clienteId && a.TenantId == tenantId)
            .OrderByDescending(a => a.FechaRegistro)
            .ToListAsync(cancellationToken);

    public async Task<Anamnesis?> GetByIdAsync(
        Guid anamnesisId, Guid tenantId, CancellationToken cancellationToken = default)
        => await context.Anamnesis
            .FirstOrDefaultAsync(
                a => a.AnamnesisId == anamnesisId && a.TenantId == tenantId,
                cancellationToken);

    public async Task<Anamnesis> AddAsync(
        Anamnesis anamnesis, CancellationToken cancellationToken = default)
    {
        context.Anamnesis.Add(anamnesis);
        await context.SaveChangesAsync(cancellationToken);
        return anamnesis;
    }

    public async Task UpdateAsync(
        Anamnesis anamnesis, CancellationToken cancellationToken = default)
    {
        context.Anamnesis.Update(anamnesis);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task SoftDeleteAsync(
        Guid anamnesisId, Guid tenantId, string deletedBy,
        CancellationToken cancellationToken = default)
    {
        var anamnesis = await context.Anamnesis
            .FirstOrDefaultAsync(
                a => a.AnamnesisId == anamnesisId && a.TenantId == tenantId,
                cancellationToken)
            ?? throw new KeyNotFoundException($"Anamnesis {anamnesisId} no encontrada.");

        anamnesis.IsDeleted = true;
        anamnesis.UpdatedAt = DateTime.UtcNow;
        anamnesis.UpdatedBy = deletedBy;

        await context.SaveChangesAsync(cancellationToken);
    }
}
