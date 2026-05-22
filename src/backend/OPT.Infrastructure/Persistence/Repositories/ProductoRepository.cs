using Microsoft.EntityFrameworkCore;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

public class ProductoRepository(OPTDbContext context) : IProductoRepository
{
    public async Task<PagedResult<Producto>> GetPagedAsync(
        Guid tenantId, string? tipoProducto, Guid? categoriaId, string? busqueda,
        int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = context.Productos
            .Include(p => p.Categoria)
            .Include(p => p.Variantes)
            .Where(p => p.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(tipoProducto))
            query = query.Where(p => p.TipoProducto == tipoProducto);

        if (categoriaId.HasValue)
            query = query.Where(p => p.CategoriaId == categoriaId.Value);

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var term = busqueda.Trim().ToLower();
            query = query.Where(p =>
                p.Nombre.ToLower().Contains(term) ||
                (p.CodigoInterno != null && p.CodigoInterno.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Producto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<Producto?> GetByIdAsync(
        Guid productoId, Guid tenantId, CancellationToken cancellationToken = default)
        => await context.Productos
            .Include(p => p.Categoria)
            .Include(p => p.Variantes.OrderBy(v => v.Nombre))
            .FirstOrDefaultAsync(
                p => p.ProductoId == productoId && p.TenantId == tenantId,
                cancellationToken);

    public async Task<bool> ExisteCodigoInternoAsync(
        string codigo, Guid tenantId, Guid? excludeProductoId = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.Productos
            .Where(p => p.TenantId == tenantId && p.CodigoInterno == codigo);

        if (excludeProductoId.HasValue)
            query = query.Where(p => p.ProductoId != excludeProductoId.Value);

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<Producto> AddAsync(
        Producto producto, CancellationToken cancellationToken = default)
    {
        context.Productos.Add(producto);
        await context.SaveChangesAsync(cancellationToken);
        return producto;
    }

    public async Task UpdateAsync(
        Producto producto, CancellationToken cancellationToken = default)
    {
        context.Productos.Update(producto);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task SoftDeleteAsync(
        Guid productoId, Guid tenantId, string deletedBy,
        CancellationToken cancellationToken = default)
    {
        var producto = await context.Productos
            .FirstOrDefaultAsync(
                p => p.ProductoId == productoId && p.TenantId == tenantId,
                cancellationToken)
            ?? throw new KeyNotFoundException($"Producto {productoId} no encontrado.");

        producto.IsDeleted = true;
        producto.UpdatedAt = DateTime.UtcNow;
        producto.UpdatedBy = deletedBy;

        await context.SaveChangesAsync(cancellationToken);
    }
}
