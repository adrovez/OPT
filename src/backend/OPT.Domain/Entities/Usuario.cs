namespace OPT.Domain.Entities;

/// <summary>
/// Usuario del sistema con autenticación JWT por RUT + contraseña.
/// Cada usuario pertenece a un Tenant (aislamiento multi-tenant).
/// </summary>
public class Usuario
{
    public int UsuarioId { get; set; }
    public int TenantId { get; set; }

    /// <summary>RUT del usuario (único por Tenant, soft-deleted excluido)</summary>
    public string RutUsuario { get; set; } = string.Empty;

    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>'Admin' | 'Operador' | 'Lectura'</summary>
    public string Rol { get; set; } = "Operador";

    public DateTime FechaIngreso { get; set; } = DateTime.UtcNow;

    // Auditoría
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
}
