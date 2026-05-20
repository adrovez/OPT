using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

public class SucursalRepository(OPTDbContext context) : ISucursalRepository
{
    public async Task<IReadOnlyList<Sucursal>> GetAllAsync(Guid tenantId)
        => await context.Sucursales
            .Where(s => s.TenantId == tenantId)
            .OrderBy(s => s.Nombre)
            .ToListAsync();

    public async Task<Sucursal?> GetByIdAsync(Guid sucursalId, Guid tenantId)
        => await context.Sucursales
            .FirstOrDefaultAsync(s => s.SucursalId == sucursalId && s.TenantId == tenantId);

    public async Task AddAsync(Sucursal sucursal)
    {
        await context.Sucursales.AddAsync(sucursal);
        await context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Sucursal sucursal)
    {
        context.Sucursales.Update(sucursal);
        await context.SaveChangesAsync();
    }

    public async Task SoftDeleteAsync(Guid sucursalId, Guid tenantId, string deletedBy)
    {
        var sucursal = await GetByIdAsync(sucursalId, tenantId)
            ?? throw new KeyNotFoundException($"Sucursal {sucursalId} no encontrada.");

        sucursal.IsDeleted = true;
        sucursal.UpdatedAt = DateTime.UtcNow;
        sucursal.UpdatedBy = deletedBy;
        await context.SaveChangesAsync();
    }
}
