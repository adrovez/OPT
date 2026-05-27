using CobroServicioEntity = OPT.Domain.Entities.CobroServicio;

namespace OPT.Application.Interfaces;

public interface ICobroServicioRepository
{
    Task<CobroServicioEntity?> GetByAtencionIdAsync(Guid atencionId, Guid tenantId, CancellationToken ct = default);
    Task AddAsync(CobroServicioEntity cobro, CancellationToken ct = default);
}
