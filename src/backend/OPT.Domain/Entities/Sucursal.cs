namespace OPT.Domain.Entities;

/// <summary>
/// Sucursal de una óptica. Pertenece a un Tenant.
/// Una sucursal puede ser la matriz (sede principal) cuando Matriz = true.
/// </summary>
public class Sucursal
{
    public Guid SucursalId { get; set; }
    public Guid TenantId { get; set; }

    public string Nombre { get; set; } = string.Empty;
    public string? Direccion { get; set; }
    public string? Telefono { get; set; }

    /// <summary>Indica si esta sucursal es la sede principal del tenant.</summary>
    public bool Matriz { get; set; } = false;

    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    // ── Auditoría ─────────────────────────────────────────────────────────
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
}
