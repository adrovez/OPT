using AnamnesisEntity = OPT.Domain.Entities.Anamnesis;

namespace OPT.Application.Interfaces;

/// <summary>
/// Contrato de persistencia para Anamnesis.
/// Todas las operaciones filtran por TenantId (multi-tenant).
/// </summary>
public interface IAnamnesisRepository
{
    /// <summary>Lista todas las anamnesis activas de un cliente dentro del tenant.</summary>
    Task<IReadOnlyList<AnamnesisEntity>> GetByClienteAsync(
        Guid clienteId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>Obtiene una anamnesis por ID validando que pertenezca al tenant.</summary>
    Task<AnamnesisEntity?> GetByIdAsync(
        Guid anamnesisId, Guid tenantId, CancellationToken cancellationToken = default);

    Task<AnamnesisEntity> AddAsync(AnamnesisEntity anamnesis, CancellationToken cancellationToken = default);
    Task UpdateAsync(AnamnesisEntity anamnesis, CancellationToken cancellationToken = default);
    Task SoftDeleteAsync(Guid anamnesisId, Guid tenantId, string deletedBy, CancellationToken cancellationToken = default);
}
