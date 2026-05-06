using Microsoft.EntityFrameworkCore;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repositorio de Usuarios. Las consultas siempre incluyen TenantId
/// para evitar acceso cruzado entre tenants.
/// </summary>
public class UsuarioRepository(OPTDbContext context) : IUsuarioRepository
{
    public async Task<Usuario?> GetByRutAsync(
        string rut, int tenantId, CancellationToken cancellationToken = default)
        => await context.Usuarios
            .FirstOrDefaultAsync(u => u.RutUsuario == rut && u.TenantId == tenantId,
                cancellationToken);
}
