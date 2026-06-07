namespace OPT.Domain.Entities;

public class OrdenTrabajoPago
{
    public Guid PagoId { get; set; }
    public Guid OTId { get; set; }
    public Guid TenantId { get; set; }
    public int FormaPagoId { get; set; }
    public decimal Monto { get; set; }
    public DateOnly FechaPago { get; set; }

    /// <summary>true = abono ingresado al crear/editar OT; false = pago posterior desde Caja</summary>
    public bool EsAbono { get; set; }

    public string? Observacion { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public bool IsDeleted { get; set; }

    // Navegaciones
    public FormaPago? FormaPago { get; set; }
    public OrdenTrabajo? OT { get; set; }
}
