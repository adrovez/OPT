using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repositorio de Contactos sobre SQL Server vía EF Core.
/// Todas las consultas incluyen el filtro TenantId para garantizar aislamiento multi-tenant.
/// El QueryFilter global en OPTDbContext ya excluye IsDeleted = true.
/// </summary>
public class ContactoRepository(OPTDbContext context) : IContactoRepository
{
    public async Task<IReadOnlyList<Contacto>> GetByClienteAsync(
        Guid clienteId, Guid tenantId, CancellationToken cancellationToken = default)
        => await context.Contactos
            .Where(c => c.ClienteId == clienteId && c.TenantId == tenantId)
            .OrderBy(c => c.Nombre)
            .ToListAsync(cancellationToken);

    public async Task<Contacto?> GetByIdAsync(
        Guid contactoId, Guid tenantId, CancellationToken cancellationToken = default)
        => await context.Contactos
            .FirstOrDefaultAsync(
                c => c.ContactoId == contactoId && c.TenantId == tenantId,
                cancellationToken);

    public async Task<Contacto> AddAsync(
        Contacto contacto, CancellationToken cancellationToken = default)
    {
        context.Contactos.Add(contacto);
        await context.SaveChangesAsync(cancellationToken);
        return contacto;
    }

    public async Task AddRangeAsync(
        IEnumerable<Contacto> contactos, CancellationToken cancellationToken = default)
    {
        context.Contactos.AddRange(contactos);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        Contacto contacto, CancellationToken cancellationToken = default)
    {
        context.Contactos.Update(contacto);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task SoftDeleteAsync(
        Guid contactoId, Guid tenantId, string deletedBy,
        CancellationToken cancellationToken = default)
    {
        var contacto = await context.Contactos
            .FirstOrDefaultAsync(
                c => c.ContactoId == contactoId && c.TenantId == tenantId,
                cancellationToken)
            ?? throw new KeyNotFoundException(
                $"Contacto {contactoId} no encontrado en este tenant.");

        contacto.IsDeleted = true;
        contacto.UpdatedAt = DateTime.UtcNow;
        contacto.UpdatedBy = deletedBy;

        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task SoftDeleteByClienteAsync(
        Guid clienteId, Guid tenantId, string deletedBy,
        CancellationToken cancellationToken = default)
    {
        // IgnoreQueryFilters para acceder también a los ya soft-deleted (idempotente)
        var contactos = await context.Contactos
            .IgnoreQueryFilters()
            .Where(c => c.ClienteId == clienteId && c.TenantId == tenantId && !c.IsDeleted)
            .ToListAsync(cancellationToken);

        if (contactos.Count == 0) return;

        var now = DateTime.UtcNow;
        foreach (var c in contactos)
        {
            c.IsDeleted = true;
            c.UpdatedAt = now;
            c.UpdatedBy = deletedBy;
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
