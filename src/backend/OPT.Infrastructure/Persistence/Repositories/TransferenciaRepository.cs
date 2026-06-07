using Microsoft.EntityFrameworkCore;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;
using TransferenciaEntity = OPT.Domain.Entities.Transferencia;
using StockEntity = OPT.Domain.Entities.Stock;
using MovimientoEntity = OPT.Domain.Entities.MovimientoStock;
using LineaEntity = OPT.Domain.Entities.TransferenciaLinea;

namespace OPT.Infrastructure.Persistence.Repositories;

public class TransferenciaRepository(OPTDbContext db) : ITransferenciaRepository
{
    public async Task<PagedResult<TransferenciaEntity>> GetPagedAsync(
        Guid tenantId, Guid? sucursalId, string? estado,
        int page, int pageSize, CancellationToken ct = default)
    {
        var q = db.Transferencias
            .Include(t => t.SucursalOrigen)
            .Include(t => t.SucursalDestino)
            .Include(t => t.Lineas).ThenInclude(l => l.Producto)
            .Where(t => t.TenantId == tenantId);

        if (sucursalId.HasValue)
            q = q.Where(t => t.SucursalOrigenId == sucursalId.Value ||
                              t.SucursalDestinoId == sucursalId.Value);
        if (estado is not null) q = q.Where(t => t.Estado == estado);

        var totalCount = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(t => t.FechaTransferencia)
            .ThenByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<TransferenciaEntity>
        {
            Items      = items,
            TotalCount = totalCount,
            Page       = page,
            PageSize   = pageSize
        };
    }

    public Task<TransferenciaEntity?> GetByIdAsync(
        Guid tenantId, Guid transferenciaId, CancellationToken ct = default)
        => db.Transferencias
            .Include(t => t.SucursalOrigen)
            .Include(t => t.SucursalDestino)
            .Include(t => t.Lineas).ThenInclude(l => l.Producto)
            .FirstOrDefaultAsync(t => t.TenantId == tenantId && t.TransferenciaId == transferenciaId, ct);

    public async Task<Guid> CrearAsync(
        Guid tenantId, Guid sucursalOrigenId, Guid sucursalDestinoId,
        DateOnly fechaTransferencia, string? observaciones,
        IReadOnlyList<TransferenciaLineaInput> lineas,
        Guid usuarioId, string createdBy, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        var transferencia = new TransferenciaEntity
        {
            TransferenciaId    = Guid.NewGuid(),
            TenantId           = tenantId,
            SucursalOrigenId   = sucursalOrigenId,
            SucursalDestinoId  = sucursalDestinoId,
            FechaTransferencia = fechaTransferencia,
            Observaciones      = observaciones,
            Estado             = "Pendiente",
            CreatedAt          = now,
            CreatedBy          = createdBy
        };
        db.Transferencias.Add(transferencia);

        foreach (var linea in lineas)
        {
            db.TransferenciasLineas.Add(new LineaEntity
            {
                LineaId          = Guid.NewGuid(),
                TenantId         = tenantId,
                TransferenciaId  = transferencia.TransferenciaId,
                ProductoId       = linea.ProductoId,
                Cantidad         = linea.Cantidad
            });
        }

        await db.SaveChangesAsync(ct);
        return transferencia.TransferenciaId;
    }

    public async Task ConfirmarAsync(
        Guid tenantId, Guid transferenciaId, Guid usuarioId, string updatedBy,
        CancellationToken ct = default)
    {
        var transferencia = await db.Transferencias
            .Include(t => t.Lineas)
            .FirstOrDefaultAsync(t => t.TenantId == tenantId && t.TransferenciaId == transferenciaId, ct)
            ?? throw new KeyNotFoundException($"Transferencia {transferenciaId} no encontrada.");

        if (transferencia.Estado != "Pendiente")
            throw new InvalidOperationException(
                $"Solo se pueden confirmar transferencias en estado Pendiente. Estado actual: {transferencia.Estado}.");

        var now = DateTime.UtcNow;

        foreach (var linea in transferencia.Lineas)
        {
            // ── Stock origen ──────────────────────────────────────────────────
            var stockOrigen = await db.Stocks
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(
                    s => s.TenantId == tenantId &&
                         s.SucursalId == transferencia.SucursalOrigenId &&
                         s.ProductoId == linea.ProductoId, ct)
                ?? throw new InvalidOperationException(
                    $"No hay registro de stock para producto {linea.ProductoId} en sucursal origen.");

            var cantidadAntesOrigen = stockOrigen.CantidadDisponible;
            stockOrigen.CantidadDisponible -= linea.Cantidad;
            stockOrigen.UpdatedAt = now;
            stockOrigen.UpdatedBy = updatedBy;

            db.MovimientosStock.Add(new MovimientoEntity
            {
                MovimientoId      = Guid.NewGuid(),
                TenantId          = tenantId,
                SucursalId        = transferencia.SucursalOrigenId,
                ProductoId        = linea.ProductoId,
                UsuarioId         = usuarioId,
                TipoMovimiento    = "TransferenciaSalida",
                Cantidad          = linea.Cantidad,
                CantidadAntes     = cantidadAntesOrigen,
                CantidadDespues   = stockOrigen.CantidadDisponible,
                TransferenciaId   = transferenciaId,
                FechaMovimiento   = now,
                CreatedAt         = now,
                CreatedBy         = updatedBy
            });

            // ── Stock destino ─────────────────────────────────────────────────
            var stockDestino = await db.Stocks
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(
                    s => s.TenantId == tenantId &&
                         s.SucursalId == transferencia.SucursalDestinoId &&
                         s.ProductoId == linea.ProductoId, ct);

            if (stockDestino is null)
            {
                stockDestino = new StockEntity
                {
                    TenantId   = tenantId,
                    SucursalId = transferencia.SucursalDestinoId,
                    ProductoId = linea.ProductoId,
                    CreatedAt  = now,
                    CreatedBy  = updatedBy
                };
                db.Stocks.Add(stockDestino);
            }
            else if (stockDestino.IsDeleted)
            {
                stockDestino.IsDeleted = false;
                stockDestino.UpdatedAt = now;
                stockDestino.UpdatedBy = updatedBy;
            }

            var cantidadAntesDestino = stockDestino.CantidadDisponible;
            stockDestino.CantidadDisponible += linea.Cantidad;
            stockDestino.UpdatedAt = now;
            stockDestino.UpdatedBy = updatedBy;

            db.MovimientosStock.Add(new MovimientoEntity
            {
                MovimientoId      = Guid.NewGuid(),
                TenantId          = tenantId,
                SucursalId        = transferencia.SucursalDestinoId,
                ProductoId        = linea.ProductoId,
                UsuarioId         = usuarioId,
                TipoMovimiento    = "TransferenciaEntrada",
                Cantidad          = linea.Cantidad,
                CantidadAntes     = cantidadAntesDestino,
                CantidadDespues   = stockDestino.CantidadDisponible,
                TransferenciaId   = transferenciaId,
                FechaMovimiento   = now,
                CreatedAt         = now,
                CreatedBy         = updatedBy
            });
        }

        transferencia.Estado    = "Confirmada";
        transferencia.UpdatedAt = now;
        transferencia.UpdatedBy = updatedBy;

        await db.SaveChangesAsync(ct);
    }

    public async Task AnularAsync(
        Guid tenantId, Guid transferenciaId, Guid usuarioId, string updatedBy,
        CancellationToken ct = default)
    {
        var transferencia = await db.Transferencias
            .Include(t => t.Lineas)
            .FirstOrDefaultAsync(t => t.TenantId == tenantId && t.TransferenciaId == transferenciaId, ct)
            ?? throw new KeyNotFoundException($"Transferencia {transferenciaId} no encontrada.");

        if (transferencia.Estado == "Anulada")
            throw new InvalidOperationException("La transferencia ya está anulada.");

        var now = DateTime.UtcNow;

        if (transferencia.Estado == "Confirmada")
        {
            if (!transferencia.Lineas.Any())
                throw new InvalidOperationException(
                    "No se puede anular una transferencia confirmada sin líneas.");

            foreach (var linea in transferencia.Lineas)
            {
                // Devolver stock al origen
                var stockOrigen = await db.Stocks
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(
                        s => s.TenantId == tenantId &&
                             s.SucursalId == transferencia.SucursalOrigenId &&
                             s.ProductoId == linea.ProductoId, ct)
                    ?? throw new InvalidOperationException(
                        $"No se encontró stock del producto {linea.ProductoId} en sucursal origen.");

                var antesOrigen = stockOrigen.CantidadDisponible;
                stockOrigen.CantidadDisponible += linea.Cantidad;
                stockOrigen.UpdatedAt = now;
                stockOrigen.UpdatedBy = updatedBy;

                db.MovimientosStock.Add(new MovimientoEntity
                {
                    MovimientoId    = Guid.NewGuid(),
                    TenantId        = tenantId,
                    SucursalId      = transferencia.SucursalOrigenId,
                    ProductoId      = linea.ProductoId,
                    UsuarioId       = usuarioId,
                    TipoMovimiento  = "Ajuste",
                    Cantidad        = linea.Cantidad,
                    CantidadAntes   = antesOrigen,
                    CantidadDespues = stockOrigen.CantidadDisponible,
                    TransferenciaId = transferenciaId,
                    Observacion     = $"Anulación transferencia {transferenciaId}",
                    FechaMovimiento = now, CreatedAt = now, CreatedBy = updatedBy
                });

                // Descontar stock del destino
                var stockDestino = await db.Stocks
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(
                        s => s.TenantId == tenantId &&
                             s.SucursalId == transferencia.SucursalDestinoId &&
                             s.ProductoId == linea.ProductoId, ct)
                    ?? throw new InvalidOperationException(
                        $"No se encontró stock del producto {linea.ProductoId} en sucursal destino.");

                var antesDestino = stockDestino.CantidadDisponible;
                stockDestino.CantidadDisponible -= linea.Cantidad;
                stockDestino.UpdatedAt = now;
                stockDestino.UpdatedBy = updatedBy;

                db.MovimientosStock.Add(new MovimientoEntity
                {
                    MovimientoId    = Guid.NewGuid(),
                    TenantId        = tenantId,
                    SucursalId      = transferencia.SucursalDestinoId,
                    ProductoId      = linea.ProductoId,
                    UsuarioId       = usuarioId,
                    TipoMovimiento  = "Ajuste",
                    Cantidad        = -linea.Cantidad,
                    CantidadAntes   = antesDestino,
                    CantidadDespues = stockDestino.CantidadDisponible,
                    TransferenciaId = transferenciaId,
                    Observacion     = $"Anulación transferencia {transferenciaId}",
                    FechaMovimiento = now, CreatedAt = now, CreatedBy = updatedBy
                });
            }
        }

        transferencia.Estado    = "Anulada";
        transferencia.UpdatedAt = now;
        transferencia.UpdatedBy = updatedBy;

        await db.SaveChangesAsync(ct);
    }
}
