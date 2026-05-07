using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repositorio de solo lectura para el catálogo de Comunas.
/// Las Comunas son datos globales (sin TenantId).
/// El QueryFilter global en OPTDbContext ya excluye IsDeleted = true.
/// </summary>
public class ComunaRepository(OPTDbContext context) : IComunaRepository
{
    public async Task<IReadOnlyList<Comuna>> GetByRegionAsync(
        int idRegion, CancellationToken cancellationToken = default)
        => await context.Comunas
            .Where(c => c.IdRegion == idRegion)
            .OrderBy(c => c.Nombre)
            .ToListAsync(cancellationToken);

    public async Task<Comuna?> GetByIdAsync(
        int idComuna, CancellationToken cancellationToken = default)
        => await context.Comunas
            .FirstOrDefaultAsync(c => c.IdComuna == idComuna, cancellationToken);
}
