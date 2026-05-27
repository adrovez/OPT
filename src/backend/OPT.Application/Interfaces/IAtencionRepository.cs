using AtencionEntity = OPT.Domain.Entities.Atencion;

namespace OPT.Application.Interfaces;

public interface IAtencionRepository
{
    Task<IReadOnlyList<AtencionEntity>> GetAllAsync(
        Guid tenantId, Guid sucursalId,
        DateTime? desde, DateTime? hasta,
        string? estado,
        CancellationToken ct = default);

    Task<AtencionEntity?> GetByIdAsync(Guid atencionId, Guid tenantId, CancellationToken ct = default);
    Task AddAsync(AtencionEntity atencion, CancellationToken ct = default);
    Task UpdateAsync(AtencionEntity atencion, CancellationToken ct = default);
}
