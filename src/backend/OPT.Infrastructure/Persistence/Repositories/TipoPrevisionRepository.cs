using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Application.Prevision.DTOs;

namespace OPT.Infrastructure.Persistence.Repositories;

/// <summary>Repositorio de solo lectura para el catálogo de Tipos de Previsión.</summary>
public class TipoPrevisionRepository(OPTDbContext db) : ITipoPrevisionRepository
{
    public async Task<IReadOnlyList<TipoPrevisionDto>> GetAllAsync(
        CancellationToken ct = default)
        => await db.TiposPrevisiones
            .OrderBy(t => t.IdTipoPrevision)
            .Select(t => new TipoPrevisionDto
            {
                IdTipoPrevision = t.IdTipoPrevision,
                Descripcion     = t.Descripcion
            })
            .ToListAsync(ct);
}
