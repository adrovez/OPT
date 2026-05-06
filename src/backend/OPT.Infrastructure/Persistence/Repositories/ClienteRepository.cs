using Microsoft.EntityFrameworkCore;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repositorio de Clientes sobre SQL Server vía EF Core.
/// Todas las consultas incluyen el filtro TenantId para garantizar aislamiento multi-tenant.
/// El QueryFilter global en OPTDbContext ya excluye IsDeleted = true.
/// </summary>
public class ClienteRepository(OPTDbContext context) : IClienteRepository
{
    public async Task<PagedResult<Cliente>> GetPagedAsync(
        int tenantId, string? tipoCliente, string? busqueda,
        int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = context.Clientes
            .Where(c => c.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(tipoCliente))
            query = query.Where(c => c.TipoCliente == tipoCliente);

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var term = busqueda.Trim().ToLower();
            query = query.Where(c =>
                c.Nombre.ToLower().Contains(term) ||
                c.NumeroDocumento.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(c => c.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Cliente>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<Cliente?> GetByIdAsync(
        int clienteId, int tenantId, CancellationToken cancellationToken = default)
        => await context.Clientes
            .FirstOrDefaultAsync(c => c.ClienteId == clienteId && c.TenantId == tenantId,
                cancellationToken);

    public async Task<bool> ExisteDocumentoAsync(
        string numeroDocumento, int tenantId, int? excludeClienteId = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.Clientes
            .Where(c => c.TenantId == tenantId && c.NumeroDocumento == numeroDocumento);

        if (excludeClienteId.HasValue)
            query = query.Where(c => c.ClienteId != excludeClienteId.Value);

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<Cliente> AddAsync(
        Cliente cliente, CancellationToken cancellationToken = default)
    {
        context.Clientes.Add(cliente);
        await context.SaveChangesAsync(cancellationToken);
        return cliente;
    }

    public async Task UpdateAsync(
        Cliente cliente, CancellationToken cancellationToken = default)
    {
        context.Clientes.Update(cliente);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task SoftDeleteAsync(
        int clienteId, int tenantId, string deletedBy,
        CancellationToken cancellationToken = default)
    {
        var cliente = await context.Clientes
            .FirstOrDefaultAsync(c => c.ClienteId == clienteId && c.TenantId == tenantId,
                cancellationToken)
            ?? throw new KeyNotFoundException(
                $"Cliente {clienteId} no encontrado en este tenant.");

        cliente.IsDeleted = true;
        cliente.UpdatedAt = DateTime.UtcNow;
        cliente.UpdatedBy = deletedBy;

        await context.SaveChangesAsync(cancellationToken);
    }
}
