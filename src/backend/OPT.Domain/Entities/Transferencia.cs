namespace OPT.Domain.Entities;

public class Transferencia
{
    public Guid TransferenciaId { get; set; }
    public Guid TenantId { get; set; }
    public Guid SucursalOrigenId { get; set; }
    public Guid SucursalDestinoId { get; set; }

    /// <summary>Columna DATE en BD → DateOnly en C#.</summary>
    public DateOnly FechaTransferencia { get; set; }

    /// <summary>'Pendiente' | 'Confirmada' | 'Anulada'</summary>
    public string Estado { get; set; } = "Pendiente";

    public string? Observaciones { get; set; }

    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    public Sucursal SucursalOrigen { get; set; } = null!;
    public Sucursal SucursalDestino { get; set; } = null!;
    public List<TransferenciaLinea> Lineas { get; set; } = [];
    public List<MovimientoStock> Movimientos { get; set; } = [];
}
