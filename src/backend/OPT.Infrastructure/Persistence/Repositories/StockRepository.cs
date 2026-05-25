using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

public class StockRepository(OPTDbContext context) : IStockRepository
{
    public async Task<IReadOnlyList<Stock>> GetStockBySucursalAsync(Guid tenantId, Guid sucursalId, CancellationToken ct = default)
        => await context.Stocks
            .Include(s => s.Variante).ThenInclude(v => v.Producto)
            .Where(s => s.TenantId == tenantId && s.SucursalId == sucursalId)
            .OrderBy(s => s.Variante.Producto.Nombre).ThenBy(s => s.Variante.Nombre)
            .ToListAsync(ct);

    public async Task<Stock?> GetStockByVarianteAsync(Guid tenantId, Guid sucursalId, Guid varianteId, CancellationToken ct = default)
        => await context.Stocks
            .Include(s => s.Variante).ThenInclude(v => v.Producto)
            .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.SucursalId == sucursalId && s.VarianteId == varianteId, ct);

    public async Task<IReadOnlyList<MovimientoStock>> GetHistorialAsync(
        Guid tenantId, Guid sucursalId,
        DateTime? desde, DateTime? hasta, string? tipoMovimiento,
        CancellationToken ct = default)
    {
        var query = context.MovimientosStock
            .Include(m => m.Variante).ThenInclude(v => v.Producto)
            .Include(m => m.Usuario)
            .Where(m => m.TenantId == tenantId && m.SucursalId == sucursalId);

        if (desde.HasValue)          query = query.Where(m => m.FechaMovimiento >= desde.Value);
        if (hasta.HasValue)          query = query.Where(m => m.FechaMovimiento <= hasta.Value);
        if (tipoMovimiento is not null) query = query.Where(m => m.TipoMovimiento == tipoMovimiento);

        return await query.OrderByDescending(m => m.FechaMovimiento).ToListAsync(ct);
    }

    public async Task<Guid> RegistrarMovimientoAsync(
        Guid tenantId, Guid sucursalId, Guid varianteId, Guid usuarioId,
        string tipoMovimiento, int cantidad, string? referencia, string? observacion,
        string createdBy, CancellationToken ct = default)
    {
        // Buscar stock existente ignorando el query filter de IsDeleted para no crear duplicados
        var stock = await context.Stocks
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.SucursalId == sucursalId && s.VarianteId == varianteId, ct);

        if (stock is null)
        {
            stock = new Stock
            {
                TenantId   = tenantId,
                SucursalId = sucursalId,
                VarianteId = varianteId,
                CreatedBy  = createdBy
            };
            await context.Stocks.AddAsync(stock, ct);
        }
        else if (stock.IsDeleted)
        {
            // Reactivar si fue borrado lógicamente
            stock.IsDeleted  = false;
            stock.UpdatedAt  = DateTime.UtcNow;
            stock.UpdatedBy  = createdBy;
        }

        var cantidadAntes = stock.CantidadDisponible;
        var delta = tipoMovimiento switch
        {
            "Entrada" =>  cantidad,
            "Salida"  => -cantidad,
            "Ajuste"  =>  cantidad,  // firmado: positivo suma, negativo resta
            _ => throw new InvalidOperationException($"TipoMovimiento '{tipoMovimiento}' no válido.")
        };

        stock.CantidadDisponible = cantidadAntes + delta;
        stock.UpdatedAt          = DateTime.UtcNow;
        stock.UpdatedBy          = createdBy;

        var movimiento = new MovimientoStock
        {
            TenantId        = tenantId,
            SucursalId      = sucursalId,
            VarianteId      = varianteId,
            UsuarioId       = usuarioId,
            TipoMovimiento  = tipoMovimiento,
            Cantidad        = cantidad,
            CantidadAntes   = cantidadAntes,
            CantidadDespues = stock.CantidadDisponible,
            Referencia      = referencia,
            Observacion     = observacion,
            CreatedBy       = createdBy
        };

        await context.MovimientosStock.AddAsync(movimiento, ct);
        await context.SaveChangesAsync(ct);

        return movimiento.MovimientoId;
    }
}
