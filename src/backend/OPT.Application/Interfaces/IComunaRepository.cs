using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

/// <summary>
/// Contrato de lectura para el catálogo de Comunas.
/// Las Comunas son datos globales (sin TenantId).
/// </summary>
public interface IComunaRepository
{
    /// <summary>Devuelve todas las comunas de una región específica.</summary>
    Task<IReadOnlyList<Comuna>> GetByRegionAsync(int idRegion, CancellationToken cancellationToken = default);

    /// <summary>Obtiene una comuna por su ID.</summary>
    Task<Comuna?> GetByIdAsync(int idComuna, CancellationToken cancellationToken = default);
}
