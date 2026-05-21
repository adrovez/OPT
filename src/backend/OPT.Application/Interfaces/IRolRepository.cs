using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

/// <summary>Contrato de solo lectura para el catálogo de Roles.</summary>
public interface IRolRepository
{
    Task<IReadOnlyList<Rol>> GetAllAsync(CancellationToken cancellationToken = default);
}
