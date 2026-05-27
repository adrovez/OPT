namespace OPT.Domain.Entities;

public class Atencion
{
    public Guid AtencionId { get; set; }
    public Guid TenantId { get; set; }
    public Guid SucursalId { get; set; }

    public Guid? AgendaId { get; set; }
    public Guid ClienteId { get; set; }
    public Guid UsuarioAtencionId { get; set; }
    public Guid? AnamnesisId { get; set; }
    public Guid? RecetaCristalesId { get; set; }

    public DateTime FechaHoraAtencion { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string? Observaciones { get; set; }
    public string Estado { get; set; } = "Abierta";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navegación
    public Agenda? Agenda { get; set; }
    public Cliente? Cliente { get; set; }
    public Usuario? UsuarioAtencion { get; set; }
    public Anamnesis? Anamnesis { get; set; }
    public RecetaCristales? RecetaCristales { get; set; }
    public Sucursal? Sucursal { get; set; }
    public CobroServicio? CobroServicio { get; set; }
}
