using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

public class AtencionRepository(OPTDbContext context) : IAtencionRepository
{
    public async Task<IReadOnlyList<Atencion>> GetAllAsync(
        Guid tenantId, Guid sucursalId,
        DateTime? desde, DateTime? hasta,
        string? estado,
        CancellationToken ct = default)
    {
        var query = context.Atenciones
            .Include(a => a.Cliente)
            .Include(a => a.Sucursal)
            .Include(a => a.UsuarioAtencion)
            .Include(a => a.CobroServicio)
            .Where(a => a.TenantId == tenantId && a.SucursalId == sucursalId);

        if (desde.HasValue) query = query.Where(a => a.FechaHoraAtencion >= desde.Value);
        if (hasta.HasValue) query = query.Where(a => a.FechaHoraAtencion <= hasta.Value);
        if (estado is not null) query = query.Where(a => a.Estado == estado);

        return await query.OrderByDescending(a => a.FechaHoraAtencion).ToListAsync(ct);
    }

    public async Task<Atencion?> GetByIdAsync(Guid atencionId, Guid tenantId, CancellationToken ct = default)
        => await context.Atenciones
            .Include(a => a.Cliente)
            .Include(a => a.Sucursal)
            .Include(a => a.UsuarioAtencion)
            .Include(a => a.CobroServicio)
                .ThenInclude(c => c!.FormaPago)
            .FirstOrDefaultAsync(a => a.AtencionId == atencionId && a.TenantId == tenantId, ct);

    public async Task AddAsync(Atencion atencion, CancellationToken ct = default)
    {
        await context.Atenciones.AddAsync(atencion, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Atencion atencion, CancellationToken ct = default)
    {
        context.Atenciones.Update(atencion);
        await context.SaveChangesAsync(ct);
    }
}
