using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

public class UsuarioRepository(OPTDbContext context) : IUsuarioRepository
{
    public async Task<Usuario?> GetByRutAsync(string rut, Guid tenantId, CancellationToken ct = default)
        => await context.Usuarios
            .Include(u => u.UsuarioSucursales)
                .ThenInclude(us => us.Sucursal)
            .FirstOrDefaultAsync(u => u.RutUsuario == rut && u.TenantId == tenantId, ct);

    public async Task<IReadOnlyList<Usuario>> GetAllAsync(Guid tenantId, CancellationToken ct = default)
        => await context.Usuarios
            .Include(u => u.UsuarioSucursales)
                .ThenInclude(us => us.Sucursal)
            .Where(u => u.TenantId == tenantId)
            .OrderBy(u => u.Nombre)
            .ToListAsync(ct);

    public async Task<Usuario?> GetByIdAsync(Guid usuarioId, Guid tenantId, CancellationToken ct = default)
        => await context.Usuarios
            .Include(u => u.UsuarioSucursales)
                .ThenInclude(us => us.Sucursal)
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.TenantId == tenantId, ct);

    public async Task AddAsync(Usuario usuario, CancellationToken ct = default)
    {
        await context.Usuarios.AddAsync(usuario, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Usuario usuario, CancellationToken ct = default)
    {
        context.Usuarios.Update(usuario);
        await context.SaveChangesAsync(ct);
    }

    public async Task SoftDeleteAsync(Guid usuarioId, Guid tenantId, string deletedBy, CancellationToken ct = default)
    {
        var usuario = await context.Usuarios
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.TenantId == tenantId, ct)
            ?? throw new KeyNotFoundException($"Usuario {usuarioId} no encontrado.");

        usuario.IsDeleted = true;
        usuario.UpdatedAt = DateTime.UtcNow;
        usuario.UpdatedBy = deletedBy;
        await context.SaveChangesAsync(ct);
    }

    public async Task AssignSucursalAsync(Guid usuarioId, Guid sucursalId, string assignedBy, CancellationToken ct = default)
    {
        var pivote = new UsuarioSucursal
        {
            UsuarioId  = usuarioId,
            SucursalId = sucursalId,
            AssignedAt = DateTime.UtcNow,
            AssignedBy = assignedBy
        };
        await context.UsuarioSucursales.AddAsync(pivote, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task RemoveSucursalAsync(Guid usuarioId, Guid sucursalId, CancellationToken ct = default)
    {
        var pivote = await context.UsuarioSucursales
            .FirstOrDefaultAsync(us => us.UsuarioId == usuarioId && us.SucursalId == sucursalId, ct);

        if (pivote is not null)
        {
            context.UsuarioSucursales.Remove(pivote);
            await context.SaveChangesAsync(ct);
        }
    }

    public async Task<bool> ExistsSucursalAssignmentAsync(Guid usuarioId, Guid sucursalId, CancellationToken ct = default)
        => await context.UsuarioSucursales
            .AnyAsync(us => us.UsuarioId == usuarioId && us.SucursalId == sucursalId, ct);
}
