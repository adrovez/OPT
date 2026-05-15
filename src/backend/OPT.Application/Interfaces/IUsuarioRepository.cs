using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

/// <summary>
/// Contrato de persistencia para Usuarios.
/// Todas las operaciones filtran implícitamente por TenantId.
/// </summary>
public interface IUsuarioRepository
{
    /// <summary>Busca un usuario activo por RUT dentro del tenant.</summary>
    Task<Usuario?> GetByRutAsync(string rut, Guid tenantId, CancellationToken cancellationToken = default);
}
