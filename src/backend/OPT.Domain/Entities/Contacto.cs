namespace OPT.Domain.Entities;

/// <summary>
/// Contacto asociado a un Cliente de tipo Empresa (multi-tenant).
/// Un cliente Empresa puede tener múltiples contactos activos.
/// </summary>
public class Contacto
{
    public Guid ContactoId { get; set; }
    public Guid TenantId { get; set; }
    public Guid ClienteId { get; set; }

    public string Nombre { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Cargo { get; set; }
    public bool Activo { get; set; } = true;

    // Navegación
    public Cliente? Cliente { get; set; }

    // Auditoría
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
}
