using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repositorio de solo lectura para el catálogo de Regiones.
/// Las Regiones son datos globales (sin TenantId).
/// El QueryFilter global en OPTDbContext ya excluye IsDeleted = true.
/// </summary>
public class RegionRepository(OPTDbContext context) : IRegionRepository
{
    public async Task<IReadOnlyList<Region>> GetAllAsync(
        CancellationToken cancellationToken = default)
        => await context.Regiones
            .OrderBy(r => r.Nombre)
            .ToListAsync(cancellationToken);

    public async Task<Region?> GetByIdAsync(
        int idRegion, CancellationToken cancellationToken = default)
        => await context.Regiones
            .FirstOrDefaultAsync(r => r.IdRegion == idRegion, cancellationToken);

    public async Task<IReadOnlyList<Region>> GetAllWithComunasAsync(
        CancellationToken cancellationToken = default)
        => await context.Regiones
            .Include(r => r.Comunas.OrderBy(c => c.Nombre))
            .OrderBy(r => r.Nombre)
            .ToListAsync(cancellationToken);
}
