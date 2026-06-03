namespace OPT.Domain.Entities;

public class Stock
{
    public Guid StockId { get; set; }
    public Guid TenantId { get; set; }
    public Guid ProductoId { get; set; }
    public Guid SucursalId { get; set; }
    public int CantidadDisponible { get; set; }
    public int StockMinimo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;

    public Producto Producto { get; set; } = null!;
    public Sucursal Sucursal { get; set; } = null!;
}
