using OPT.Application.Common;
using OTEntity = OPT.Domain.Entities.OrdenTrabajo;

namespace OPT.Application.Interfaces;

public record OTLineaInput(Guid ProductoId, int Cantidad, decimal ValorUnitario, string? Comentario);
public record OTAbonoInput(int FormaPagoId, decimal Monto, DateOnly FechaPago, string? Observacion);

public interface IOrdenTrabajoRepository
{
    Task<bool> ExisteNumeroOTAsync(
        string numeroOT, Guid tenantId, Guid? excluirOTId,
        CancellationToken ct = default);

    Task<Guid> CrearAsync(
        Guid tenantId, Guid sucursalId, string numeroOT, Guid clienteId,
        string tipoFacturacion, Guid? empresaClienteId, string? beneficiario,
        Guid? atencionId, Guid? recetaCristalesId,
        DateOnly fechaEntrega, TimeOnly? horaEntrega,
        decimal descuento, int numeroCuotas, DateOnly? fechaInicioCuotas,
        string? observacion,
        IReadOnlyList<OTLineaInput> lineas,
        IReadOnlyList<OTAbonoInput> abonos,
        string createdBy,
        CancellationToken ct = default);

    Task ActualizarAsync(
        Guid otId, Guid tenantId, string numeroOT, Guid clienteId,
        string tipoFacturacion, Guid? empresaClienteId, string? beneficiario,
        Guid? recetaCristalesId,
        DateOnly fechaEntrega, TimeOnly? horaEntrega,
        decimal descuento, int numeroCuotas, DateOnly? fechaInicioCuotas,
        string? observacion,
        IReadOnlyList<OTLineaInput> lineas,
        IReadOnlyList<OTAbonoInput> abonos,
        string updatedBy,
        CancellationToken ct = default);

    Task SoftDeleteAsync(
        Guid otId, Guid tenantId, string deletedBy,
        CancellationToken ct = default);

    Task CambiarEtapaAsync(
        Guid otId, Guid tenantId, string nuevaEtapa,
        string responsable, string? observacion,
        CancellationToken ct = default);

    Task<Guid> RegistrarPagoAsync(
        Guid otId, Guid tenantId, int formaPagoId, decimal monto,
        DateOnly fechaPago, string? observacion, string createdBy,
        CancellationToken ct = default);

    Task<OTEntity?> GetByIdAsync(
        Guid otId, Guid tenantId,
        CancellationToken ct = default);

    Task<PagedResult<OTEntity>> GetPagedAsync(
        Guid tenantId, Guid? sucursalId, int page, int pageSize,
        string? numeroOT, Guid? clienteId, string? estadoPago, string? etapaOT,
        CancellationToken ct = default);
}
