namespace OPT.Application.Interfaces;

/// <summary>
/// Extrae el TenantId del JWT del request HTTP actual.
/// Garantiza aislamiento multi-tenant en cada operación.
/// </summary>
public interface ICurrentTenantService
{
    /// <summary>
    /// TenantId del usuario autenticado.
    /// Lanza InvalidOperationException si no hay usuario autenticado.
    /// </summary>
    Guid TenantId { get; }

    /// <summary>RUT del usuario autenticado.</summary>
    string RutUsuario { get; }
}
