using OPT.Application.Common;
using TransferenciaEntity = OPT.Domain.Entities.Transferencia;

namespace OPT.Application.Interfaces;

public record TransferenciaLineaInput(Guid ProductoId, int Cantidad);

public interface ITransferenciaRepository
{
    Task<PagedResult<TransferenciaEntity>> GetPagedAsync(
        Guid tenantId,
        Guid? sucursalId,
        string? estado,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<TransferenciaEntity?> GetByIdAsync(
        Guid tenantId, Guid transferenciaId, CancellationToken ct = default);

    Task<Guid> CrearAsync(
        Guid tenantId,
        Guid sucursalOrigenId,
        Guid sucursalDestinoId,
        DateOnly fechaTransferencia,
        string? observaciones,
        IReadOnlyList<TransferenciaLineaInput> lineas,
        Guid usuarioId,
        string createdBy,
        CancellationToken ct = default);

    /// <summary>
    /// Confirma la transferencia: genera TransferenciaSalida (origen) + TransferenciaEntrada (destino).
    /// Solo si Estado == Pendiente.
    /// </summary>
    Task ConfirmarAsync(
        Guid tenantId,
        Guid transferenciaId,
        Guid usuarioId,
        string updatedBy,
        CancellationToken ct = default);

    /// <summary>
    /// Anula la transferencia. Si ya estaba Confirmada, genera movimientos compensatorios.
    /// </summary>
    Task AnularAsync(
        Guid tenantId,
        Guid transferenciaId,
        Guid usuarioId,
        string updatedBy,
        CancellationToken ct = default);
}
