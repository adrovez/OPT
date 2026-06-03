namespace OPT.Domain.Entities;

public class DocumentoEntrada
{
    public Guid DocumentoId { get; set; }
    public Guid TenantId { get; set; }
    public Guid SucursalId { get; set; }

    /// <summary>'FacturaCompra' | 'BoletaCompra' | 'GuiaDespacho' | 'OtroIngreso'</summary>
    public string TipoDocumento { get; set; } = string.Empty;

    public string? NumeroDocumento { get; set; }

    /// <summary>Columna DATE en BD → DateOnly en C#.</summary>
    public DateOnly FechaDocumento { get; set; }

    public string? ProveedorNombre { get; set; }
    public string? ProveedorRut { get; set; }
    public string? Observaciones { get; set; }

    /// <summary>'Borrador' | 'Confirmado' | 'Anulado'</summary>
    public string Estado { get; set; } = "Borrador";

    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    public Sucursal Sucursal { get; set; } = null!;
    public List<DocumentoEntradaLinea> Lineas { get; set; } = [];
    public List<MovimientoStock> Movimientos { get; set; } = [];
}
