using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

public class AgendaRepository(OPTDbContext context) : IAgendaRepository
{
    public async Task<IReadOnlyList<Agenda>> GetAllAsync(
        Guid tenantId, Guid sucursalId,
        DateTime? desde, DateTime? hasta,
        string? estado, Guid? usuarioId,
        CancellationToken ct = default)
    {
        var query = context.Agendas
            .Include(a => a.Cliente)
            .Include(a => a.Sucursal)
            .Include(a => a.Usuario)
            .Where(a => a.TenantId == tenantId && a.SucursalId == sucursalId);

        if (desde.HasValue)      query = query.Where(a => a.FechaHora >= desde.Value);
        if (hasta.HasValue)      query = query.Where(a => a.FechaHora <= hasta.Value);
        if (estado is not null)  query = query.Where(a => a.Estado == estado);
        if (usuarioId.HasValue)  query = query.Where(a => a.UsuarioId == usuarioId);

        return await query.OrderBy(a => a.FechaHora).ToListAsync(ct);
    }

    public async Task<Agenda?> GetByIdAsync(Guid agendaId, Guid tenantId, CancellationToken ct = default)
        => await context.Agendas
            .Include(a => a.Cliente)
            .Include(a => a.Sucursal)
            .Include(a => a.Usuario)
            .FirstOrDefaultAsync(a => a.AgendaId == agendaId && a.TenantId == tenantId, ct);

    public async Task AddAsync(Agenda agenda, CancellationToken ct = default)
    {
        await context.Agendas.AddAsync(agenda, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Agenda agenda, CancellationToken ct = default)
    {
        context.Agendas.Update(agenda);
        await context.SaveChangesAsync(ct);
    }

    public async Task SoftDeleteAsync(Guid agendaId, Guid tenantId, string deletedBy, CancellationToken ct = default)
    {
        var agenda = await context.Agendas
            .FirstOrDefaultAsync(a => a.AgendaId == agendaId && a.TenantId == tenantId, ct)
            ?? throw new KeyNotFoundException($"Agenda {agendaId} no encontrada.");

        agenda.IsDeleted = true;
        agenda.UpdatedAt = DateTime.UtcNow;
        agenda.UpdatedBy = deletedBy;
        await context.SaveChangesAsync(ct);
    }
}
