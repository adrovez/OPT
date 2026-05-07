namespace OPT.Domain.Entities;

/// <summary>
/// Catálogo de Comunas, agrupadas por Región.
/// Dato compartido (sin TenantId), administrado por el sistema.
/// </summary>
public class Comuna
{
    public int IdComuna { get; set; }
    public int IdRegion { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Codigo { get; set; }

    // Navegación
    public Region? Region { get; set; }

    // Auditoría
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
}
