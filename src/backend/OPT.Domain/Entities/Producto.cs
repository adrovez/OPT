namespace OPT.Domain.Entities;

public class Producto
{
    public Guid ProductoId { get; set; }
    public Guid TenantId { get; set; }
    public Guid? CategoriaId { get; set; }

    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    /// <summary>'Almacenable' | 'Consumible' | 'Servicio'</summary>
    public string TipoProducto { get; set; } = "Almacenable";

    public string? CodigoInterno { get; set; }
    public bool Activo { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navegación
    public ProductoCategoria? Categoria { get; set; }
    public ICollection<ProductoVariante> Variantes { get; set; } = [];
}
