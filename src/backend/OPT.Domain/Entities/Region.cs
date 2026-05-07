namespace OPT.Domain.Entities;

/// <summary>
/// Catálogo de Regiones del país.
/// Dato compartido (sin TenantId), administrado por el sistema.
/// </summary>
public class Region
{
    public int IdRegion { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Codigo { get; set; }

    // Navegación
    public ICollection<Comuna> Comunas { get; set; } = [];

    // Auditoría
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
}
