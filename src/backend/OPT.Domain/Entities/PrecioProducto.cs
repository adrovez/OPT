namespace OPT.Domain.Entities;

public class PrecioProducto
{
    public Guid PrecioId { get; set; }
    public Guid TenantId { get; set; }
    public Guid VarianteId { get; set; }
    public Guid? SucursalId { get; set; }   // null = precio global del tenant

    public decimal PrecioCosto { get; set; }
    public decimal? PrecioVenta { get; set; }

    public DateTime VigenciaDesde { get; set; } = DateTime.UtcNow;
    public DateTime? VigenciaHasta { get; set; }  // null = vigente

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }

    public ProductoVariante Variante { get; set; } = null!;
    public Sucursal? Sucursal { get; set; }
}
