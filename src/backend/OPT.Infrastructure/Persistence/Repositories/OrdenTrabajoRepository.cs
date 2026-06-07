using Microsoft.EntityFrameworkCore;
using OPT.Application.Common;
using OPT.Application.Interfaces;
using OTEntity = OPT.Domain.Entities.OrdenTrabajo;
using LineaEntity = OPT.Domain.Entities.OrdenTrabajoLinea;
using PagoEntity = OPT.Domain.Entities.OrdenTrabajoPago;
using CuotaEntity = OPT.Domain.Entities.OrdenTrabajoCuota;
using BitacoraEntity = OPT.Domain.Entities.OrdenTrabajoBitacora;

namespace OPT.Infrastructure.Persistence.Repositories;

public class OrdenTrabajoRepository(OPTDbContext db) : IOrdenTrabajoRepository
{
    // ── ExisteNumeroOT ─────────────────────────────────────────────────────
    public Task<bool> ExisteNumeroOTAsync(
        string numeroOT, Guid tenantId, Guid? excluirOTId,
        CancellationToken ct = default)
        => db.OrdenesTrabajo
            .IgnoreQueryFilters()
            .AnyAsync(ot =>
                ot.TenantId == tenantId &&
                ot.NumeroOT == numeroOT &&
                !ot.IsDeleted &&
                (excluirOTId == null || ot.OTId != excluirOTId), ct);

    // ── Crear ──────────────────────────────────────────────────────────────
    public async Task<Guid> CrearAsync(
        Guid tenantId, Guid sucursalId, string numeroOT, Guid clienteId,
        string tipoFacturacion, Guid? empresaClienteId, string? beneficiario,
        Guid? atencionId, Guid? recetaCristalesId,
        DateOnly fechaEntrega, TimeOnly? horaEntrega,
        decimal descuento, int numeroCuotas, DateOnly? fechaInicioCuotas,
        string? observacion,
        IReadOnlyList<OTLineaInput> lineas,
        IReadOnlyList<OTAbonoInput> abonos,
        string createdBy,
        CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        var subTotal    = lineas.Sum(l => l.Cantidad * l.ValorUnitario);
        var montoTotal  = subTotal - descuento;
        var totalAbonado = abonos.Sum(a => a.Monto);
        var saldo       = montoTotal - totalAbonado;

        var ot = new OTEntity
        {
            OTId              = Guid.NewGuid(),
            TenantId          = tenantId,
            SucursalId        = sucursalId,
            NumeroOT          = numeroOT,
            ClienteId         = clienteId,
            TipoFacturacion   = tipoFacturacion,
            EmpresaClienteId  = empresaClienteId,
            Beneficiario      = beneficiario,
            AtencionId        = atencionId,
            RecetaCristalesId = recetaCristalesId,
            FechaIngreso      = DateOnly.FromDateTime(now),
            FechaEntrega      = fechaEntrega,
            HoraEntrega       = horaEntrega,
            SubTotal          = subTotal,
            Descuento         = descuento,
            MontoTotal        = montoTotal,
            TotalAbonado      = totalAbonado,
            Saldo             = saldo < 0 ? 0 : saldo,
            NumeroCuotas      = numeroCuotas,
            FechaInicioCuotas = fechaInicioCuotas,
            EstadoPago        = totalAbonado >= montoTotal ? "Pagado" : "Pendiente",
            EtapaOT           = "Ingresado",
            Observacion       = observacion,
            CreatedAt         = now,
            CreatedBy         = createdBy
        };
        db.OrdenesTrabajo.Add(ot);

        foreach (var linea in lineas)
        {
            db.OrdenesTrabajoLineas.Add(new LineaEntity
            {
                LineaId       = Guid.NewGuid(),
                OTId          = ot.OTId,
                TenantId      = tenantId,
                ProductoId    = linea.ProductoId,
                Cantidad      = linea.Cantidad,
                ValorUnitario = linea.ValorUnitario,
                Comentario    = linea.Comentario
            });
        }

        foreach (var abono in abonos)
        {
            db.OrdenesTrabajoPagos.Add(new PagoEntity
            {
                PagoId      = Guid.NewGuid(),
                OTId        = ot.OTId,
                TenantId    = tenantId,
                FormaPagoId = abono.FormaPagoId,
                Monto       = abono.Monto,
                FechaPago   = abono.FechaPago,
                EsAbono     = true,
                Observacion = abono.Observacion,
                CreatedAt   = now,
                CreatedBy   = createdBy
            });
        }

        // Cuotas
        if (numeroCuotas > 0 && saldo > 0 && fechaInicioCuotas.HasValue)
            GenerarCuotas(ot.OTId, tenantId, numeroCuotas, saldo, fechaInicioCuotas.Value);

        // Primera entrada bitácora
        db.OrdenesTrabajoBitacora.Add(new BitacoraEntity
        {
            BitacoraId  = Guid.NewGuid(),
            OTId        = ot.OTId,
            TenantId    = tenantId,
            Etapa       = "Ingresado",
            Fecha       = now,
            Responsable = createdBy,
            Observacion = observacion
        });

        await db.SaveChangesAsync(ct);
        return ot.OTId;
    }

    // ── Actualizar ─────────────────────────────────────────────────────────
    public async Task ActualizarAsync(
        Guid otId, Guid tenantId, string numeroOT, Guid clienteId,
        string tipoFacturacion, Guid? empresaClienteId, string? beneficiario,
        Guid? recetaCristalesId,
        DateOnly fechaEntrega, TimeOnly? horaEntrega,
        decimal descuento, int numeroCuotas, DateOnly? fechaInicioCuotas,
        string? observacion,
        IReadOnlyList<OTLineaInput> lineas,
        IReadOnlyList<OTAbonoInput> abonos,
        string updatedBy,
        CancellationToken ct = default)
    {
        var ot = await db.OrdenesTrabajo
            .Include(o => o.Lineas)
            .Include(o => o.Pagos)
            .Include(o => o.Cuotas)
            .FirstOrDefaultAsync(o => o.OTId == otId && o.TenantId == tenantId, ct)
            ?? throw new KeyNotFoundException($"Orden de Trabajo {otId} no encontrada.");

        if (ot.EtapaOT is not ("Ingresado" or "EnProceso"))
            throw new InvalidOperationException(
                $"Solo se puede editar una OT en etapa 'Ingresado' o 'EnProceso'. Etapa actual: {ot.EtapaOT}.");

        // Verificar unicidad de número si cambió
        if (ot.NumeroOT != numeroOT)
        {
            var duplicado = await ExisteNumeroOTAsync(numeroOT, tenantId, otId, ct);
            if (duplicado)
                throw new InvalidOperationException($"Ya existe una Orden de Trabajo con el número '{numeroOT}'.");
        }

        var now = DateTime.UtcNow;

        // Soft-delete líneas existentes
        foreach (var l in ot.Lineas)
            l.IsDeleted = true;

        // Soft-delete abonos iniciales
        foreach (var p in ot.Pagos.Where(p => p.EsAbono))
            p.IsDeleted = true;

        // Soft-delete cuotas
        foreach (var c in ot.Cuotas)
            c.IsDeleted = true;

        // Nuevas líneas
        foreach (var linea in lineas)
        {
            db.OrdenesTrabajoLineas.Add(new LineaEntity
            {
                LineaId       = Guid.NewGuid(),
                OTId          = otId,
                TenantId      = tenantId,
                ProductoId    = linea.ProductoId,
                Cantidad      = linea.Cantidad,
                ValorUnitario = linea.ValorUnitario,
                Comentario    = linea.Comentario
            });
        }

        // Nuevos abonos
        foreach (var abono in abonos)
        {
            db.OrdenesTrabajoPagos.Add(new PagoEntity
            {
                PagoId      = Guid.NewGuid(),
                OTId        = otId,
                TenantId    = tenantId,
                FormaPagoId = abono.FormaPagoId,
                Monto       = abono.Monto,
                FechaPago   = abono.FechaPago,
                EsAbono     = true,
                Observacion = abono.Observacion,
                CreatedAt   = now,
                CreatedBy   = updatedBy
            });
        }

        // Recalcular totales
        var newSubTotal   = lineas.Sum(l => l.Cantidad * l.ValorUnitario);
        var newMontoTotal = newSubTotal - descuento;
        var pagosPosteriores = ot.Pagos
            .Where(p => !p.EsAbono && !p.IsDeleted)
            .Sum(p => p.Monto);
        var newTotalAbonado = abonos.Sum(a => a.Monto) + pagosPosteriores;
        var newSaldo = newMontoTotal - newTotalAbonado;
        if (newSaldo < 0) newSaldo = 0;

        // Nuevas cuotas
        if (numeroCuotas > 0 && newSaldo > 0 && fechaInicioCuotas.HasValue)
            GenerarCuotas(otId, tenantId, numeroCuotas, newSaldo, fechaInicioCuotas.Value);

        // Actualizar cabecera
        ot.NumeroOT          = numeroOT;
        ot.ClienteId         = clienteId;
        ot.TipoFacturacion   = tipoFacturacion;
        ot.EmpresaClienteId  = empresaClienteId;
        ot.Beneficiario      = beneficiario;
        ot.RecetaCristalesId = recetaCristalesId;
        ot.FechaEntrega      = fechaEntrega;
        ot.HoraEntrega       = horaEntrega;
        ot.SubTotal          = newSubTotal;
        ot.Descuento         = descuento;
        ot.MontoTotal        = newMontoTotal;
        ot.TotalAbonado      = newTotalAbonado;
        ot.Saldo             = newSaldo;
        ot.NumeroCuotas      = numeroCuotas;
        ot.FechaInicioCuotas = fechaInicioCuotas;
        ot.EstadoPago        = newTotalAbonado >= newMontoTotal ? "Pagado" : "Pendiente";
        ot.Observacion       = observacion;
        ot.UpdatedAt         = now;
        ot.UpdatedBy         = updatedBy;

        await db.SaveChangesAsync(ct);
    }

    // ── SoftDelete ─────────────────────────────────────────────────────────
    public async Task SoftDeleteAsync(
        Guid otId, Guid tenantId, string deletedBy,
        CancellationToken ct = default)
    {
        var ot = await db.OrdenesTrabajo
            .FirstOrDefaultAsync(o => o.OTId == otId && o.TenantId == tenantId, ct)
            ?? throw new KeyNotFoundException($"Orden de Trabajo {otId} no encontrada.");

        if (ot.EtapaOT is not ("Ingresado" or "EnProceso"))
            throw new InvalidOperationException(
                $"Solo se puede eliminar una OT en etapa 'Ingresado' o 'EnProceso'. Etapa actual: {ot.EtapaOT}.");

        ot.IsDeleted = true;
        ot.UpdatedAt = DateTime.UtcNow;
        ot.UpdatedBy = deletedBy;

        await db.SaveChangesAsync(ct);
    }

    // ── CambiarEtapa ───────────────────────────────────────────────────────
    public async Task CambiarEtapaAsync(
        Guid otId, Guid tenantId, string nuevaEtapa,
        string responsable, string? observacion,
        CancellationToken ct = default)
    {
        var ot = await db.OrdenesTrabajo
            .FirstOrDefaultAsync(o => o.OTId == otId && o.TenantId == tenantId, ct)
            ?? throw new KeyNotFoundException($"Orden de Trabajo {otId} no encontrada.");

        if (ot.EtapaOT == "Entregado")
            throw new InvalidOperationException("La OT ya fue entregada y no puede cambiar de etapa.");

        var now = DateTime.UtcNow;
        ot.EtapaOT   = nuevaEtapa;
        ot.UpdatedAt = now;
        ot.UpdatedBy = responsable;

        db.OrdenesTrabajoBitacora.Add(new BitacoraEntity
        {
            BitacoraId  = Guid.NewGuid(),
            OTId        = otId,
            TenantId    = tenantId,
            Etapa       = nuevaEtapa,
            Fecha       = now,
            Responsable = responsable,
            Observacion = observacion
        });

        await db.SaveChangesAsync(ct);
    }

    // ── RegistrarPago ──────────────────────────────────────────────────────
    public async Task<Guid> RegistrarPagoAsync(
        Guid otId, Guid tenantId, int formaPagoId, decimal monto,
        DateOnly fechaPago, string? observacion, string createdBy,
        CancellationToken ct = default)
    {
        var ot = await db.OrdenesTrabajo
            .Include(o => o.Pagos)
            .FirstOrDefaultAsync(o => o.OTId == otId && o.TenantId == tenantId, ct)
            ?? throw new KeyNotFoundException($"Orden de Trabajo {otId} no encontrada.");

        var now    = DateTime.UtcNow;
        var pagoId = Guid.NewGuid();

        db.OrdenesTrabajoPagos.Add(new PagoEntity
        {
            PagoId      = pagoId,
            OTId        = otId,
            TenantId    = tenantId,
            FormaPagoId = formaPagoId,
            Monto       = monto,
            FechaPago   = fechaPago,
            EsAbono     = false,
            Observacion = observacion,
            CreatedAt   = now,
            CreatedBy   = createdBy
        });

        // Recalcular: total actual de pagos no soft-deleted + el nuevo
        var newTotalAbonado = ot.Pagos.Where(p => !p.IsDeleted).Sum(p => p.Monto) + monto;
        var newSaldo        = ot.MontoTotal - newTotalAbonado;

        ot.TotalAbonado = newTotalAbonado;
        ot.Saldo        = newSaldo < 0 ? 0 : newSaldo;
        ot.EstadoPago   = ot.Saldo <= 0 ? "Pagado" : "Pendiente";
        ot.UpdatedAt    = now;

        await db.SaveChangesAsync(ct);
        return pagoId;
    }

    // ── GetById ────────────────────────────────────────────────────────────
    public Task<OTEntity?> GetByIdAsync(
        Guid otId, Guid tenantId,
        CancellationToken ct = default)
        => db.OrdenesTrabajo
            .Include(ot => ot.Cliente)
            .Include(ot => ot.EmpresaCliente)
            .Include(ot => ot.Lineas).ThenInclude(l => l.Producto)
            .Include(ot => ot.Pagos).ThenInclude(p => p.FormaPago)
            .Include(ot => ot.Cuotas)
            .Include(ot => ot.Bitacora)
            .FirstOrDefaultAsync(ot => ot.OTId == otId && ot.TenantId == tenantId, ct);

    // ── GetPaged ───────────────────────────────────────────────────────────
    public async Task<PagedResult<OTEntity>> GetPagedAsync(
        Guid tenantId, Guid? sucursalId, int page, int pageSize,
        string? numeroOT, Guid? clienteId, string? estadoPago, string? etapaOT,
        CancellationToken ct = default)
    {
        var query = db.OrdenesTrabajo
            .Include(ot => ot.Cliente)
            .Include(ot => ot.EmpresaCliente)
            .Where(ot => ot.TenantId == tenantId);

        if (sucursalId.HasValue)
            query = query.Where(ot => ot.SucursalId == sucursalId.Value);

        if (!string.IsNullOrWhiteSpace(numeroOT))
            query = query.Where(ot => ot.NumeroOT.Contains(numeroOT));

        if (clienteId.HasValue)
            query = query.Where(ot => ot.ClienteId == clienteId.Value);

        if (!string.IsNullOrWhiteSpace(estadoPago))
            query = query.Where(ot => ot.EstadoPago == estadoPago);

        if (!string.IsNullOrWhiteSpace(etapaOT))
            query = query.Where(ot => ot.EtapaOT == etapaOT);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(ot => ot.FechaIngreso)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<OTEntity>
        {
            Items      = items,
            TotalCount = total,
            Page       = page,
            PageSize   = pageSize
        };
    }

    // ── Helper: generar cuotas ─────────────────────────────────────────────
    private void GenerarCuotas(
        Guid otId, Guid tenantId,
        int numeroCuotas, decimal saldo, DateOnly fechaInicio)
    {
        var valorCuota = Math.Floor(saldo / numeroCuotas);
        for (int i = 1; i <= numeroCuotas; i++)
        {
            var valor = (i == numeroCuotas)
                ? saldo - valorCuota * (numeroCuotas - 1)
                : valorCuota;

            db.OrdenesTrabajoCuotas.Add(new CuotaEntity
            {
                CuotaId          = Guid.NewGuid(),
                OTId             = otId,
                TenantId         = tenantId,
                Numero           = i,
                ValorCuota       = valor,
                FechaVencimiento = fechaInicio.AddMonths(i - 1),
                Estado           = "Pendiente"
            });
        }
    }
}
