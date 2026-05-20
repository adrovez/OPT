using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

public interface ISucursalRepository
{
    Task<IReadOnlyList<Sucursal>> GetAllAsync(Guid tenantId);
    Task<Sucursal?> GetByIdAsync(Guid sucursalId, Guid tenantId);
    Task AddAsync(Sucursal sucursal);
    Task UpdateAsync(Sucursal sucursal);
    Task SoftDeleteAsync(Guid sucursalId, Guid tenantId, string deletedBy);
}
