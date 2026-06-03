namespace OPT.Domain.Entities;

public class TransferenciaLinea
{
    public Guid LineaId { get; set; }
    public Guid TenantId { get; set; }
    public Guid TransferenciaId { get; set; }
    public Guid ProductoId { get; set; }
    public int Cantidad { get; set; }

    public Transferencia Transferencia { get; set; } = null!;
    public Producto Producto { get; set; } = null!;
}
