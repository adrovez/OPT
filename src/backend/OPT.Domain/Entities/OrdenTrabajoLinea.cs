namespace OPT.Domain.Entities;

public class OrdenTrabajoLinea
{
    public Guid LineaId { get; set; }
    public Guid OTId { get; set; }
    public Guid TenantId { get; set; }
    public Guid ProductoId { get; set; }
    public int Cantidad { get; set; }
    public decimal ValorUnitario { get; set; }
    public string? Comentario { get; set; }
    public bool IsDeleted { get; set; }

    // Navegaciones
    public Producto? Producto { get; set; }
    public OrdenTrabajo? OT { get; set; }
}
