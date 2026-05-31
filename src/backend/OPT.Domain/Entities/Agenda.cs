namespace OPT.Domain.Entities;

public class Agenda
{
    public Guid AgendaId { get; set; }
    public Guid TenantId { get; set; }
    public Guid SucursalId { get; set; }
    public Guid ClienteId { get; set; }
    public Guid? UsuarioId { get; set; }

    public DateTime FechaHora { get; set; }
    public short DuracionMinutos { get; set; } = 30;
    public string Motivo { get; set; } = string.Empty;
    public string Estado { get; set; } = "Ingresado";
    public string? Observaciones { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navegación
    public Sucursal Sucursal { get; set; } = null!;
    public Cliente Cliente { get; set; } = null!;
    public Usuario? Usuario { get; set; }
}
