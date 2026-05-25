namespace OPT.Domain.Entities;

public class DocumentoStock
{
    public Guid DocumentoId { get; set; }
    public Guid TenantId { get; set; }
    public Guid SucursalId { get; set; }

    public string TipoDocumento { get; set; } = string.Empty;  // FacturaCompra | BoletaCompra | OtroIngreso
    public string NumeroDocumento { get; set; } = string.Empty;
    public DateOnly Fecha { get; set; }
    public string? ProveedorNombre { get; set; }
    public string Estado { get; set; } = "Confirmado";  // Confirmado | Anulado
    public string? Observacion { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    public Sucursal Sucursal { get; set; } = null!;
    public List<DocumentoStockLinea> Lineas { get; set; } = [];
    public List<MovimientoStock> Movimientos { get; set; } = [];
}
