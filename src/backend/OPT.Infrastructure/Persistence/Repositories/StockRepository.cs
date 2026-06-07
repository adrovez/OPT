using Microsoft.EntityFrameworkCore;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;
using StockEntity = OPT.Domain.Entities.Stock;
using MovimientoEntity = OPT.Domain.Entities.MovimientoStock;

namespace OPT.Infrastructure.Persistence.Repositories;

public class StockRepository(OPTDbContext context) : IStockRepository
{
    public async Task<PagedResult<StockEntity>> GetStockBySucursalAsync(
        Guid tenantId, Guid sucursalId, int page, int pageSize,
        CancellationToken ct = default)
    {
        var query = context.Stocks
            .Include(s => s.Producto)
            .Where(s => s.TenantId == tenantId && s.SucursalId == sucursalId);

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderBy(s => s.Producto.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<StockEntity>
        {
            Items      = items,
            TotalCount = totalCount,
            Page       = page,
            PageSize   = pageSize
        };
    }

    public async Task<StockEntity?> GetStockByProductoAsync(
        Guid tenantId, Guid sucursalId, Guid productoId, CancellationToken ct = default)
        => await context.Stocks
            .Include(s => s.Producto)
            .FirstOrDefaultAsync(
                s => s.TenantId == tenantId && s.SucursalId == sucursalId && s.ProductoId == productoId,
                ct);

    public async Task<IReadOnlyList<MovimientoEntity>> GetHistorialAsync(
        Guid tenantId, Guid sucursalId,
        DateTime? desde, DateTime? hasta, string? tipoMovimiento,
        CancellationToken ct = default)
    {
        var query = context.MovimientosStock
            .Include(m => m.Producto)
            .Include(m => m.Usuario)
            .Where(m => m.TenantId == tenantId && m.SucursalId == sucursalId);

        if (desde.HasValue)             query = query.Where(m => m.FechaMovimiento >= desde.Value);
        if (hasta.HasValue)             query = query.Where(m => m.FechaMovimiento <= hasta.Value);
        if (tipoMovimiento is not null) query = query.Where(m => m.TipoMovimiento == tipoMovimiento);

        return await query.OrderByDescending(m => m.FechaMovimiento).ToListAsync(ct);
    }

    public async Task<IReadOnlyList<StockEntity>> GetStockPorProductoAsync(
        Guid tenantId, Guid productoId, CancellationToken ct = default)
        => await context.Stocks
            .Include(s => s.Sucursal)
            .Where(s => s.TenantId == tenantId && s.ProductoId == productoId)
            .OrderBy(s => s.Sucursal.Nombre)
            .ToListAsync(ct);

    public async Task<Guid> RegistrarMovimientoDirectoAsync(
        Guid tenantId, Guid sucursalId, Guid productoId, Guid usuarioId,
        string tipoMovimiento, int cantidad, string? referencia, string? observacion,
        string createdBy, CancellationToken ct = default)
    {
        // Movimientos directos permitidos: Salida, Ajuste, Merma, DevolucionProveedor
        var tiposPermitidos = new HashSet<string>
            { "Salida", "Ajuste", "Merma", "DevolucionProveedor" };
        if (!tiposPermitidos.Contains(tipoMovimiento))
            throw new InvalidOperationException(
                $"TipoMovimiento '{tipoMovimiento}' no válido para movimiento directo.");

        // Obtener/crear stock
        var stock = await context.Stocks
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(
                s => s.TenantId == tenantId && s.SucursalId == sucursalId && s.ProductoId == productoId,
                ct);

        if (stock is null)
        {
            stock = new StockEntity
            {
                TenantId   = tenantId,
                SucursalId = sucursalId,
                ProductoId = productoId,
                CreatedBy  = createdBy
            };
            await context.Stocks.AddAsync(stock, ct);
        }
        else if (stock.IsDeleted)
        {
            stock.IsDeleted = false;
            stock.UpdatedAt = DateTime.UtcNow;
            stock.UpdatedBy = createdBy;
        }

        var cantidadAntes = stock.CantidadDisponible;

        var delta = tipoMovimiento switch
        {
            "Ajuste"             =>  cantidad,   // firmado: positivo suma, negativo resta
            "Salida"             => -cantidad,
            "Merma"              => -cantidad,
            "DevolucionProveedor" => -cantidad,
            _ => throw new InvalidOperationException($"TipoMovimiento '{tipoMovimiento}' no soportado.")
        };

        stock.CantidadDisponible = cantidadAntes + delta;
        stock.UpdatedAt          = DateTime.UtcNow;
        stock.UpdatedBy          = createdBy;

        var movimiento = new MovimientoEntity
        {
            TenantId        = tenantId,
            SucursalId      = sucursalId,
            ProductoId      = productoId,
            UsuarioId       = usuarioId,
            TipoMovimiento  = tipoMovimiento,
            Cantidad        = cantidad,
            CantidadAntes   = cantidadAntes,
            CantidadDespues = stock.CantidadDisponible,
            Referencia      = referencia,
            Observacion     = observacion,
            FechaMovimiento = DateTime.UtcNow,
            CreatedAt       = DateTime.UtcNow,
            CreatedBy       = createdBy
        };

        await context.MovimientosStock.AddAsync(movimiento, ct);
        await context.SaveChangesAsync(ct);

        return movimiento.MovimientoId;
    }
}
