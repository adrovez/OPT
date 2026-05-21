using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

/// <summary>Repositorio de solo lectura para el catálogo de Roles.</summary>
public class RolRepository(OPTDbContext context) : IRolRepository
{
    public async Task<IReadOnlyList<Rol>> GetAllAsync(
        CancellationToken cancellationToken = default)
        => await context.Roles
            .OrderBy(r => r.RolId)
            .ToListAsync(cancellationToken);
}
