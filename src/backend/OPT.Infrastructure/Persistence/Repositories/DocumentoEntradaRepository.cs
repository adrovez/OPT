using Microsoft.EntityFrameworkCore;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;
using DocumentoEntradaEntity = OPT.Domain.Entities.DocumentoEntrada;
using StockEntity = OPT.Domain.Entities.Stock;
using MovimientoEntity = OPT.Domain.Entities.MovimientoStock;
using LineaEntity = OPT.Domain.Entities.DocumentoEntradaLinea;

namespace OPT.Infrastructure.Persistence.Repositories;

public class DocumentoEntradaRepository(OPTDbContext db) : IDocumentoEntradaRepository
{
    public async Task<PagedResult<DocumentoEntradaEntity>> GetPagedAsync(
        Guid tenantId, Guid sucursalId, string? estado,
        int page, int pageSize, CancellationToken ct = default)
    {
        var q = db.DocumentosEntrada
            .Include(d => d.Lineas).ThenInclude(l => l.Producto)
            .Where(d => d.TenantId == tenantId && d.SucursalId == sucursalId);

        if (estado is not null) q = q.Where(d => d.Estado == estado);

        var totalCount = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(d => d.FechaDocumento)
            .ThenByDescending(d => d.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<DocumentoEntradaEntity>
        {
            Items      = items,
            TotalCount = totalCount,
            Page       = page,
            PageSize   = pageSize
        };
    }

    public Task<DocumentoEntradaEntity?> GetByIdAsync(
        Guid tenantId, Guid documentoId, CancellationToken ct = default)
        => db.DocumentosEntrada
            .Include(d => d.Lineas).ThenInclude(l => l.Producto)
            .FirstOrDefaultAsync(d => d.TenantId == tenantId && d.DocumentoId == documentoId, ct);

    public async Task<Guid> CrearBorradorAsync(
        Guid tenantId, Guid sucursalId,
        string tipoDocumento, string? numeroDocumento,
        DateOnly fechaDocumento, string? proveedorNombre, string? proveedorRut,
        string? observaciones,
        IReadOnlyList<DocumentoEntradaLineaInput> lineas,
        string createdBy, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        var doc = new DocumentoEntradaEntity
        {
            TenantId        = tenantId,
            SucursalId      = sucursalId,
            TipoDocumento   = tipoDocumento,
            NumeroDocumento = numeroDocumento,
            FechaDocumento  = fechaDocumento,
            ProveedorNombre = proveedorNombre,
            ProveedorRut    = proveedorRut,
            Observaciones   = observaciones,
            Estado          = "Borrador",
            CreatedAt       = now,
            CreatedBy       = createdBy
        };
        db.DocumentosEntrada.Add(doc);

        foreach (var linea in lineas)
        {
            db.DocumentosEntradaLineas.Add(new LineaEntity
            {
                TenantId    = tenantId,
                DocumentoId = doc.DocumentoId,
                ProductoId  = linea.ProductoId,
                Cantidad    = linea.Cantidad,
                PrecioCosto = linea.PrecioCosto,
                Observaciones = linea.Observaciones
            });
        }

        await db.SaveChangesAsync(ct);
        return doc.DocumentoId;
    }

    public async Task ConfirmarAsync(
        Guid tenantId, Guid documentoId, Guid usuarioId, string updatedBy,
        CancellationToken ct = default)
    {
        var doc = await db.DocumentosEntrada
            .Include(d => d.Lineas)
            .FirstOrDefaultAsync(d => d.TenantId == tenantId && d.DocumentoId == documentoId, ct)
            ?? throw new KeyNotFoundException($"Documento {documentoId} no encontrado.");

        if (doc.Estado != "Borrador")
            throw new InvalidOperationException(
                $"Solo se pueden confirmar documentos en estado Borrador. Estado actual: {doc.Estado}.");

        var now = DateTime.UtcNow;

        foreach (var linea in doc.Lineas)
        {
            // 1. Obtener/crear stock
            var stock = await db.Stocks
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(
                    s => s.TenantId == tenantId &&
                         s.SucursalId == doc.SucursalId &&
                         s.ProductoId == linea.ProductoId, ct);

            if (stock is null)
            {
                stock = new StockEntity
                {
                    TenantId   = tenantId,
                    SucursalId = doc.SucursalId,
                    ProductoId = linea.ProductoId,
                    CreatedAt  = now,
                    CreatedBy  = updatedBy
                };
                db.Stocks.Add(stock);
            }
            else if (stock.IsDeleted)
            {
                stock.IsDeleted = false;
                stock.UpdatedAt = now;
                stock.UpdatedBy = updatedBy;
            }

            // 2. Actualizar stock
            var cantidadAntes = stock.CantidadDisponible;
            stock.CantidadDisponible += linea.Cantidad;
            stock.UpdatedAt = now;
            stock.UpdatedBy = updatedBy;

            // 3. Movimiento
            db.MovimientosStock.Add(new MovimientoEntity
            {
                TenantId        = tenantId,
                SucursalId      = doc.SucursalId,
                ProductoId      = linea.ProductoId,
                UsuarioId       = usuarioId,
                TipoMovimiento  = "Entrada",
                Cantidad        = linea.Cantidad,
                CantidadAntes   = cantidadAntes,
                CantidadDespues = stock.CantidadDisponible,
                DocumentoId     = doc.DocumentoId,
                Referencia      = doc.NumeroDocumento,
                FechaMovimiento = now,
                CreatedAt       = now,
                CreatedBy       = updatedBy
            });

            // 4. Precio de costo
            if (linea.PrecioCosto.HasValue)
            {
                var precioActual = await db.PreciosProducto
                    .Where(p => p.TenantId == tenantId &&
                                p.ProductoId == linea.ProductoId &&
                                p.VigenciaHasta == null)
                    .FirstOrDefaultAsync(ct);

                if (precioActual is not null)
                    precioActual.VigenciaHasta = now;

                db.PreciosProducto.Add(new PrecioProducto
                {
                    TenantId      = tenantId,
                    ProductoId    = linea.ProductoId,
                    PrecioCosto   = linea.PrecioCosto.Value,
                    PrecioVenta   = precioActual?.PrecioVenta,
                    VigenciaDesde = now,
                    VigenciaHasta = null,
                    CreatedAt     = now,
                    CreatedBy     = updatedBy
                });
            }
        }

        doc.Estado    = "Confirmado";
        doc.UpdatedAt = now;
        doc.UpdatedBy = updatedBy;

        await db.SaveChangesAsync(ct);
    }

    public async Task AnularAsync(
        Guid tenantId, Guid documentoId, Guid usuarioId, string updatedBy,
        CancellationToken ct = default)
    {
        var doc = await db.DocumentosEntrada
            .Include(d => d.Lineas)
            .FirstOrDefaultAsync(d => d.TenantId == tenantId && d.DocumentoId == documentoId, ct)
            ?? throw new KeyNotFoundException($"Documento {documentoId} no encontrado.");

        if (doc.Estado != "Confirmado")
            throw new InvalidOperationException(
                $"Solo se pueden anular documentos en estado Confirmado. Estado actual: {doc.Estado}.");

        var now = DateTime.UtcNow;

        foreach (var linea in doc.Lineas)
        {
            var stock = await db.Stocks
                .FirstOrDefaultAsync(
                    s => s.TenantId == tenantId &&
                         s.SucursalId == doc.SucursalId &&
                         s.ProductoId == linea.ProductoId, ct);

            if (stock is null) continue;

            var cantidadAntes = stock.CantidadDisponible;
            stock.CantidadDisponible -= linea.Cantidad;
            stock.UpdatedAt = now;
            stock.UpdatedBy = updatedBy;

            db.MovimientosStock.Add(new MovimientoEntity
            {
                TenantId        = tenantId,
                SucursalId      = doc.SucursalId,
                ProductoId      = linea.ProductoId,
                UsuarioId       = usuarioId,
                TipoMovimiento  = "Ajuste",
                Cantidad        = -linea.Cantidad,
                CantidadAntes   = cantidadAntes,
                CantidadDespues = stock.CantidadDisponible,
                DocumentoId     = documentoId,
                Referencia      = doc.NumeroDocumento,
                Observacion     = $"Anulación de documento {doc.NumeroDocumento ?? documentoId.ToString()}",
                FechaMovimiento = now,
                CreatedAt       = now,
                CreatedBy       = updatedBy
            });
        }

        // Los precios NO se revierten al anular
        doc.Estado    = "Anulado";
        doc.UpdatedAt = now;
        doc.UpdatedBy = updatedBy;

        await db.SaveChangesAsync(ct);
    }
}
