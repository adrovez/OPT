namespace OPT.Domain.Entities;

/// <summary>Historial inmutable de cambios de etapa de una OT. Sin IsDeleted.</summary>
public class OrdenTrabajoBitacora
{
    public Guid BitacoraId { get; set; }
    public Guid OTId { get; set; }
    public Guid TenantId { get; set; }
    public string Etapa { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string Responsable { get; set; } = string.Empty;
    public string? Observacion { get; set; }

    // Navegaciones
    public OrdenTrabajo? OT { get; set; }
}
