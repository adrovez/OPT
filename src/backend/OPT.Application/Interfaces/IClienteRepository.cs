using OPT.Application.Common;
using OPT.Domain.Entities;

namespace OPT.Application.Interfaces;

/// <summary>
/// Contrato de persistencia para Clientes.
/// Todas las operaciones filtran implícitamente por TenantId (multi-tenant).
/// </summary>
public interface IClienteRepository
{
    /// <summary>Lista paginada de clientes activos del tenant.</summary>
    Task<PagedResult<Cliente>> GetPagedAsync(
        Guid tenantId,
        string? tipoCliente,
        string? busqueda,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>Obtiene un cliente por ID validando que pertenezca al tenant.</summary>
    Task<Cliente?> GetByIdAsync(Guid clienteId, Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>Verifica si ya existe un NumeroDocumento activo en el tenant.</summary>
    Task<bool> ExisteDocumentoAsync(string numeroDocumento, Guid tenantId, Guid? excludeClienteId = null, CancellationToken cancellationToken = default);

    Task<Cliente> AddAsync(Cliente cliente, CancellationToken cancellationToken = default);
    Task UpdateAsync(Cliente cliente, CancellationToken cancellationToken = default);
    Task SoftDeleteAsync(Guid clienteId, Guid tenantId, string deletedBy, CancellationToken cancellationToken = default);
}
