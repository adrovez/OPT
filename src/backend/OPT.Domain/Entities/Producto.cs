namespace OPT.Domain.Entities;

public class Producto
{
    public Guid ProductoId { get; set; }
    public Guid TenantId { get; set; }

    /// <summary>Auto-referencia para jerarquía padre/hijo (variantes).</summary>
    public Guid? ProductoPadreId { get; set; }

    public Guid? CategoriaId { get; set; }

    public string CodigoInterno { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    /// <summary>'Producto' | 'Servicio'</summary>
    public string Tipo { get; set; } = "Producto";

    public string? UnidadMedida { get; set; }
    public bool IsActivo { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navegación
    public Categoria? Categoria { get; set; }
    public Producto? ProductoPadre { get; set; }
    public ICollection<Producto> Hijos { get; set; } = [];
}
