using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

/// <summary>
/// Contrato de lectura para el catálogo de Regiones.
/// Las Regiones son datos globales (sin TenantId).
/// </summary>
public interface IRegionRepository
{
    /// <summary>Devuelve todas las regiones activas, ordenadas por nombre.</summary>
    Task<IReadOnlyList<Region>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Obtiene una región por su ID.</summary>
    Task<Region?> GetByIdAsync(int idRegion, CancellationToken cancellationToken = default);
}
