using RecetaCristalesEntity = OPT.Domain.Entities.RecetaCristales;

namespace OPT.Application.Interfaces;

/// <summary>
/// Contrato de persistencia para RecetaCristales.
/// Todas las operaciones filtran por TenantId (multi-tenant).
/// </summary>
public interface IRecetaCristalesRepository
{
    /// <summary>Lista todas las recetas activas de un cliente dentro del tenant.</summary>
    Task<IReadOnlyList<RecetaCristalesEntity>> GetByClienteAsync(
        Guid clienteId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>Obtiene una receta por ID validando que pertenezca al tenant.</summary>
    Task<RecetaCristalesEntity?> GetByIdAsync(
        Guid recetaId, Guid tenantId, CancellationToken cancellationToken = default);

    Task<RecetaCristalesEntity> AddAsync(
        RecetaCristalesEntity receta, CancellationToken cancellationToken = default);

    Task UpdateAsync(
        RecetaCristalesEntity receta, CancellationToken cancellationToken = default);

    Task SoftDeleteAsync(
        Guid recetaId, Guid tenantId, string deletedBy,
        CancellationToken cancellationToken = default);
}
