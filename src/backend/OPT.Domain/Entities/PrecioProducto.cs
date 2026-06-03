namespace OPT.Domain.Entities;

public class PrecioProducto
{
    public Guid PrecioId { get; set; }
    public Guid TenantId { get; set; }
    public Guid ProductoId { get; set; }

    public decimal? PrecioCosto { get; set; }
    public decimal? PrecioVenta { get; set; }

    public DateTime VigenciaDesde { get; set; } = DateTime.UtcNow;
    public DateTime? VigenciaHasta { get; set; }  // null = vigente

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }

    // Sin IsDeleted — la expiración se maneja con VigenciaHasta
    public Producto Producto { get; set; } = null!;
}
