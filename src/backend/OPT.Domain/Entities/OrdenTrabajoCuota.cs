namespace OPT.Domain.Entities;

public class OrdenTrabajoCuota
{
    public Guid CuotaId { get; set; }
    public Guid OTId { get; set; }
    public Guid TenantId { get; set; }
    public int Numero { get; set; }
    public decimal ValorCuota { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public DateOnly? FechaPago { get; set; }

    /// <summary>'Pendiente' | 'Pagada'</summary>
    public string Estado { get; set; } = "Pendiente";

    public bool IsDeleted { get; set; }

    // Navegaciones
    public OrdenTrabajo? OT { get; set; }
}
