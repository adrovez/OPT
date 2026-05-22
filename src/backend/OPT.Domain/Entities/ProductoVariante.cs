namespace OPT.Domain.Entities;

public class ProductoVariante
{
    public Guid VarianteId { get; set; }
    public Guid ProductoId { get; set; }
    public Guid TenantId { get; set; }

    /// <summary>Descripción libre de la variante (ej: "Negra Talla M").</summary>
    public string Nombre { get; set; } = string.Empty;

    public string? CodigoBarras { get; set; }
    public bool Activo { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navegación
    public Producto Producto { get; set; } = null!;
}
