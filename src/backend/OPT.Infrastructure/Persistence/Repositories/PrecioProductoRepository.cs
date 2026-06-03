using Microsoft.EntityFrameworkCore;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Application.Precios.DTOs;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

public class PrecioProductoRepository(OPTDbContext context) : IPrecioProductoRepository
{
    public async Task<PrecioProducto?> GetVigenteAsync(
        Guid tenantId, Guid productoId, CancellationToken ct = default)
        => await context.PreciosProducto
            .Where(p => p.TenantId == tenantId &&
                        p.ProductoId == productoId &&
                        p.VigenciaHasta == null)
            .FirstOrDefaultAsync(ct);

    public async Task<PagedResult<PrecioProductoDto>> GetVigentesPagedAsync(
        Guid tenantId,
        string? search,
        Guid? categoriaId,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = context.PreciosProducto
            .Where(p => p.TenantId == tenantId && p.VigenciaHasta == null)
            .Join(context.Productos.Where(pr => !pr.IsDeleted && pr.TenantId == tenantId),
                  p => p.ProductoId,
                  pr => pr.ProductoId,
                  (p, pr) => new { Precio = p, Producto = pr })
            .Where(x => categoriaId == null || x.Producto.CategoriaId == categoriaId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.Producto.Nombre.ToLower().Contains(term) ||
                x.Producto.CodigoInterno.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(x => x.Producto.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new PrecioProductoDto(
                x.Precio.PrecioId,
                x.Producto.ProductoId,
                x.Producto.Nombre,
                x.Producto.CodigoInterno,
                x.Producto.Categoria != null ? x.Producto.Categoria.Nombre : null,
                x.Precio.PrecioCosto,
                x.Precio.PrecioVenta,
                x.Precio.VigenciaDesde,
                x.Precio.VigenciaHasta,
                x.Precio.CreatedBy))
            .ToListAsync(ct);

        return new PagedResult<PrecioProductoDto>
        {
            Items      = items,
            TotalCount = total,
            Page       = page,
            PageSize   = pageSize
        };
    }

    public async Task<IReadOnlyList<PrecioProductoDto>> GetHistorialAsync(
        Guid tenantId, Guid productoId, CancellationToken ct = default)
        => await context.PreciosProducto
            .Where(p => p.TenantId == tenantId && p.ProductoId == productoId)
            .Join(context.Productos.Where(pr => pr.TenantId == tenantId),
                  p => p.ProductoId,
                  pr => pr.ProductoId,
                  (p, pr) => new { Precio = p, Producto = pr })
            .OrderByDescending(x => x.Precio.VigenciaDesde)
            .Select(x => new PrecioProductoDto(
                x.Precio.PrecioId,
                x.Producto.ProductoId,
                x.Producto.Nombre,
                x.Producto.CodigoInterno,
                x.Producto.Categoria != null ? x.Producto.Categoria.Nombre : null,
                x.Precio.PrecioCosto,
                x.Precio.PrecioVenta,
                x.Precio.VigenciaDesde,
                x.Precio.VigenciaHasta,
                x.Precio.CreatedBy))
            .ToListAsync(ct);

    public async Task SetPrecioAsync(
        Guid tenantId,
        Guid productoId,
        decimal? precioCosto,
        decimal? precioVenta,
        string createdBy,
        CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        var precioActual = await context.PreciosProducto
            .Where(p => p.TenantId == tenantId &&
                        p.ProductoId == productoId &&
                        p.VigenciaHasta == null)
            .FirstOrDefaultAsync(ct);

        if (precioActual is not null)
            precioActual.VigenciaHasta = now;

        context.PreciosProducto.Add(new PrecioProducto
        {
            TenantId      = tenantId,
            ProductoId    = productoId,
            PrecioCosto   = precioCosto,
            PrecioVenta   = precioVenta ?? precioActual?.PrecioVenta,
            VigenciaDesde = now,
            VigenciaHasta = null,
            CreatedAt     = now,
            CreatedBy     = createdBy
        });

        await context.SaveChangesAsync(ct);
    }
}
