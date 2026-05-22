namespace OPT.Domain.Entities;

public class ProductoCategoria
{
    public Guid CategoriaId { get; set; }
    public Guid TenantId { get; set; }
    public string Nombre { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navegación
    public ICollection<Producto> Productos { get; set; } = [];
}
