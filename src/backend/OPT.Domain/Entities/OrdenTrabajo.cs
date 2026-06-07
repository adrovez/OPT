namespace OPT.Domain.Entities;

public class OrdenTrabajo
{
    public Guid OTId { get; set; }
    public Guid TenantId { get; set; }
    public Guid SucursalId { get; set; }
    public string NumeroOT { get; set; } = string.Empty;
    public Guid ClienteId { get; set; }

    /// <summary>'Particular' | 'Empresa'</summary>
    public string TipoFacturacion { get; set; } = "Particular";

    public Guid? EmpresaClienteId { get; set; }
    public string? Beneficiario { get; set; }
    public Guid? AtencionId { get; set; }
    public Guid? RecetaCristalesId { get; set; }
    public DateOnly FechaIngreso { get; set; }
    public DateOnly FechaEntrega { get; set; }
    public TimeOnly? HoraEntrega { get; set; }
    public decimal SubTotal { get; set; }
    public decimal Descuento { get; set; }
    public decimal MontoTotal { get; set; }
    public decimal TotalAbonado { get; set; }
    public decimal Saldo { get; set; }
    public int NumeroCuotas { get; set; }
    public DateOnly? FechaInicioCuotas { get; set; }

    /// <summary>'Pendiente' | 'Pagado'</summary>
    public string EstadoPago { get; set; } = "Pendiente";

    /// <summary>'Ingresado' | 'EnProceso' | 'Montaje' | 'Laboratorio' | 'Calidad' | 'Despacho' | 'Entregado'</summary>
    public string EtapaOT { get; set; } = "Ingresado";

    public string? Observacion { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }

    // Navegaciones
    public Cliente? Cliente { get; set; }
    public Cliente? EmpresaCliente { get; set; }
    public List<OrdenTrabajoLinea> Lineas { get; set; } = [];
    public List<OrdenTrabajoPago> Pagos { get; set; } = [];
    public List<OrdenTrabajoCuota> Cuotas { get; set; } = [];
    public List<OrdenTrabajoBitacora> Bitacora { get; set; } = [];
}
