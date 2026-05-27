using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

public class CobroServicioRepository(OPTDbContext context) : ICobroServicioRepository
{
    public async Task<CobroServicio?> GetByAtencionIdAsync(Guid atencionId, Guid tenantId, CancellationToken ct = default)
        => await context.CobrosServicio
            .Include(c => c.FormaPago)
            .FirstOrDefaultAsync(c => c.AtencionId == atencionId && c.TenantId == tenantId, ct);

    public async Task AddAsync(CobroServicio cobro, CancellationToken ct = default)
    {
        await context.CobrosServicio.AddAsync(cobro, ct);
        await context.SaveChangesAsync(ct);
    }
}
