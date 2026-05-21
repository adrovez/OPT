using AgendaEntity = OPT.Domain.Entities.Agenda;

namespace OPT.Application.Interfaces;

public interface IAgendaRepository
{
    Task<IReadOnlyList<AgendaEntity>> GetAllAsync(
        Guid tenantId, Guid sucursalId,
        DateTime? desde, DateTime? hasta,
        string? estado, Guid? usuarioId,
        CancellationToken ct = default);

    Task<AgendaEntity?> GetByIdAsync(Guid agendaId, Guid tenantId, CancellationToken ct = default);
    Task AddAsync(AgendaEntity agenda, CancellationToken ct = default);
    Task UpdateAsync(AgendaEntity agenda, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid agendaId, Guid tenantId, string deletedBy, CancellationToken ct = default);
}
