using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

/// <summary>
/// Contrato de persistencia para Usuarios.
/// Todas las operaciones filtran implícitamente por TenantId.
/// </summary>
public interface IUsuarioRepository
{
    Task<Usuario?> GetByRutAsync(string rut, Guid tenantId, CancellationToken ct = default);
    Task<IReadOnlyList<Usuario>> GetAllAsync(Guid tenantId, CancellationToken ct = default);
    Task<Usuario?> GetByIdAsync(Guid usuarioId, Guid tenantId, CancellationToken ct = default);
    Task AddAsync(Usuario usuario, CancellationToken ct = default);
    Task UpdateAsync(Usuario usuario, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid usuarioId, Guid tenantId, string deletedBy, CancellationToken ct = default);

    Task AssignSucursalAsync(Guid usuarioId, Guid sucursalId, string assignedBy, CancellationToken ct = default);
    Task RemoveSucursalAsync(Guid usuarioId, Guid sucursalId, CancellationToken ct = default);
    Task<bool> ExistsSucursalAssignmentAsync(Guid usuarioId, Guid sucursalId, CancellationToken ct = default);
}
