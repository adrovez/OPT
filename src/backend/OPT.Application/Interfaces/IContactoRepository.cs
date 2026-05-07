using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

/// <summary>
/// Contrato de persistencia para Contactos.
/// Todas las operaciones filtran implícitamente por TenantId (multi-tenant).
/// </summary>
public interface IContactoRepository
{
    /// <summary>Lista todos los contactos activos de un cliente del tenant.</summary>
    Task<IReadOnlyList<Contacto>> GetByClienteAsync(
        int clienteId,
        int tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>Obtiene un contacto por ID validando que pertenezca al tenant.</summary>
    Task<Contacto?> GetByIdAsync(
        int contactoId,
        int tenantId,
        CancellationToken cancellationToken = default);

    Task<Contacto> AddAsync(Contacto contacto, CancellationToken cancellationToken = default);
    Task UpdateAsync(Contacto contacto, CancellationToken cancellationToken = default);
    Task SoftDeleteAsync(
        int contactoId,
        int tenantId,
        string deletedBy,
        CancellationToken cancellationToken = default);
}
