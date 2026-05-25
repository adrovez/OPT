using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;
using OPT.Infrastructure.Persistence;
using DocumentoStockEntity = OPT.Domain.Entities.DocumentoStock;
using StockEntity = OPT.Domain.Entities.Stock;
using MovimientoEntity = OPT.Domain.Entities.MovimientoStock;
using LineaEntity = OPT.Domain.Entities.DocumentoStockLinea;

namespace OPT.Infrastructure.Persistence.Repositories;

public class DocumentoStockRepository(OPTDbContext db) : IDocumentoStockRepository
{
    public async Task<IReadOnlyList<DocumentoStockEntity>> GetDocumentosAsync(
        Guid tenantId, Guid sucursalId,
        string? tipo, string? estado,
        DateOnly? desde, DateOnly? hasta,
        int page, int pageSize,
        CancellationToken ct = default)
    {
        var q = db.DocumentosStock
            .Include(d => d.Lineas)
                .ThenInclude(l => l.Variante)
                    .ThenInclude(v => v.Producto)
            .Where(d => d.TenantId == tenantId && d.SucursalId == sucursalId);

        if (tipo is not null)   q = q.Where(d => d.TipoDocumento == tipo);
        if (estado is not null) q = q.Where(d => d.Estado == estado);
        if (desde.HasValue)     q = q.Where(d => d.Fecha >= desde.Value);
        if (hasta.HasValue)     q = q.Where(d => d.Fecha <= hasta.Value);

        return await q
            .OrderByDescending(d => d.Fecha)
            .ThenByDescending(d => d.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> GetDocumentosCountAsync(
        Guid tenantId, Guid sucursalId,
        string? tipo, string? estado,
        DateOnly? desde, DateOnly? hasta,
        CancellationToken ct = default)
    {
        var q = db.DocumentosStock
            .Where(d => d.TenantId == tenantId && d.SucursalId == sucursalId);

        if (tipo is not null)   q = q.Where(d => d.TipoDocumento == tipo);
        if (estado is not null) q = q.Where(d => d.Estado == estado);
        if (desde.HasValue)     q = q.Where(d => d.Fecha >= desde.Value);
        if (hasta.HasValue)     q = q.Where(d => d.Fecha <= hasta.Value);

        return await q.CountAsync(ct);
    }

    public Task<DocumentoStockEntity?> GetDocumentoByIdAsync(
        Guid tenantId, Guid documentoId, CancellationToken ct = default) =>
        db.DocumentosStock
            .Include(d => d.Lineas)
                .ThenInclude(l => l.Variante)
                    .ThenInclude(v => v.Producto)
            .FirstOrDefaultAsync(d => d.TenantId == tenantId && d.DocumentoId == documentoId, ct);

    public async Task<Guid> CrearYConfirmarAsync(
        Guid tenantId, Guid sucursalId, Guid usuarioId,
        string tipoDocumento, string numeroDocumento, DateOnly fecha,
        string? proveedorNombre, string? observacion,
        IReadOnlyList<DocumentoLineaInput> lineas,
        string createdBy,
        CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        var doc = new DocumentoStockEntity
        {
            TenantId        = tenantId,
            SucursalId      = sucursalId,
            TipoDocumento   = tipoDocumento,
            NumeroDocumento = numeroDocumento,
            Fecha           = fecha,
            ProveedorNombre = proveedorNombre,
            Estado          = "Confirmado",
            Observacion     = observacion,
            CreatedAt       = now,
            CreatedBy       = createdBy,
        };
        db.DocumentosStock.Add(doc);

        foreach (var linea in lineas)
        {
            db.DocumentosStockLineas.Add(new LineaEntity
            {
                DocumentoId = doc.DocumentoId,
                VarianteId  = linea.VarianteId,
                Cantidad    = linea.Cantidad,
                PrecioCosto = linea.PrecioCosto,
            });

            // ── Stock ──────────────────────────────────────────────────────────
            var stock = await db.Stocks
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(s =>
                    s.TenantId    == tenantId    &&
                    s.SucursalId  == sucursalId  &&
                    s.VarianteId  == linea.VarianteId, ct);

            if (stock is null)
            {
                stock = new StockEntity
                {
                    TenantId   = tenantId,
                    SucursalId = sucursalId,
                    VarianteId = linea.VarianteId,
                    CreatedAt  = now,
                    CreatedBy  = createdBy,
                };
                db.Stocks.Add(stock);
            }
            else if (stock.IsDeleted)
            {
                stock.IsDeleted  = false;
                stock.UpdatedAt  = now;
                stock.UpdatedBy  = createdBy;
            }

            var cantidadAntes = stock.CantidadDisponible;
            stock.CantidadDisponible += linea.Cantidad;
            stock.UpdatedAt = now;
            stock.UpdatedBy = createdBy;

            // ── Movimiento ─────────────────────────────────────────────────────
            db.MovimientosStock.Add(new MovimientoEntity
            {
                TenantId         = tenantId,
                SucursalId       = sucursalId,
                VarianteId       = linea.VarianteId,
                UsuarioId        = usuarioId,
                TipoMovimiento   = "Entrada",
                Cantidad         = linea.Cantidad,
                CantidadAntes    = cantidadAntes,
                CantidadDespues  = stock.CantidadDisponible,
                Referencia       = numeroDocumento,
                DocumentoId      = doc.DocumentoId,
                FechaMovimiento  = now,
                CreatedAt        = now,
                CreatedBy        = createdBy,
            });

            // ── Precio de costo ────────────────────────────────────────────────
            if (linea.PrecioCosto.HasValue)
            {
                var precioActual = await db.PreciosProducto
                    .Where(p => p.TenantId == tenantId &&
                                p.VarianteId == linea.VarianteId &&
                                p.SucursalId == null &&
                                p.VigenciaHasta == null)
                    .FirstOrDefaultAsync(ct);

                if (precioActual is not null)
                    precioActual.VigenciaHasta = now;

                db.PreciosProducto.Add(new PrecioProducto
                {
                    TenantId      = tenantId,
                    VarianteId    = linea.VarianteId,
                    SucursalId    = null,
                    PrecioCosto   = linea.PrecioCosto.Value,
                    PrecioVenta   = precioActual?.PrecioVenta,
                    VigenciaDesde = now,
                    CreatedAt     = now,
                    CreatedBy     = createdBy,
                });
            }
        }

        await db.SaveChangesAsync(ct);
        return doc.DocumentoId;
    }

    public async Task AnularAsync(
        Guid tenantId, Guid documentoId, Guid usuarioId, string updatedBy,
        CancellationToken ct = default)
    {
        var doc = await db.DocumentosStock
            .Include(d => d.Lineas)
            .FirstOrDefaultAsync(d => d.TenantId == tenantId && d.DocumentoId == documentoId, ct)
            ?? throw new KeyNotFoundException($"Documento {documentoId} no encontrado.");

        if (doc.Estado != "Confirmado")
            throw new InvalidOperationException("Solo se pueden anular documentos en estado Confirmado.");

        var now = DateTime.UtcNow;

        foreach (var linea in doc.Lineas)
        {
            var stock = await db.Stocks
                .FirstOrDefaultAsync(s =>
                    s.TenantId   == tenantId   &&
                    s.SucursalId == doc.SucursalId &&
                    s.VarianteId == linea.VarianteId, ct);

            if (stock is null) continue;

            var cantidadAntes = stock.CantidadDisponible;
            stock.CantidadDisponible -= linea.Cantidad;
            stock.UpdatedAt = now;
            stock.UpdatedBy = updatedBy;

            db.MovimientosStock.Add(new MovimientoEntity
            {
                TenantId        = tenantId,
                SucursalId      = doc.SucursalId,
                VarianteId      = linea.VarianteId,
                UsuarioId       = usuarioId,
                TipoMovimiento  = "Ajuste",
                Cantidad        = -linea.Cantidad,
                CantidadAntes   = cantidadAntes,
                CantidadDespues = stock.CantidadDisponible,
                Referencia      = doc.NumeroDocumento,
                Observacion     = $"Anulación de documento {doc.NumeroDocumento}",
                DocumentoId     = documentoId,
                FechaMovimiento = now,
                CreatedAt       = now,
                CreatedBy       = updatedBy,
            });
        }

        doc.Estado    = "Anulado";
        doc.UpdatedAt = now;
        doc.UpdatedBy = updatedBy;

        await db.SaveChangesAsync(ct);
    }
}
