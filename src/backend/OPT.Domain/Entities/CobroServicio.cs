namespace OPT.Domain.Entities;

public class CobroServicio
{
    public Guid CobroServicioId { get; set; }
    public Guid TenantId { get; set; }
    public Guid SucursalId { get; set; }
    public Guid AtencionId { get; set; }
    public int FormaPagoId { get; set; }
    public decimal Monto { get; set; }
    public DateTime FechaCobro { get; set; }
    public string? Observaciones { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navegación
    public Atencion? Atencion { get; set; }
    public FormaPago? FormaPago { get; set; }
}
