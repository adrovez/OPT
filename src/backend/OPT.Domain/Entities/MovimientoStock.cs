namespace OPT.Domain.Entities;

public class MovimientoStock
{
    public Guid MovimientoId { get; set; }
    public Guid TenantId { get; set; }
    public Guid VarianteId { get; set; }
    public Guid SucursalId { get; set; }
    public Guid UsuarioId { get; set; }

    public string TipoMovimiento { get; set; } = string.Empty; // Entrada | Salida | Ajuste
    public int Cantidad { get; set; }       // Entrada/Salida: > 0 | Ajuste: ± firmado
    public int CantidadAntes { get; set; }
    public int CantidadDespues { get; set; }

    public string? Referencia { get; set; }  // nro. orden, factura, remisión, etc.
    public string? Observacion { get; set; }

    public DateTime FechaMovimiento { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }

    public Guid? DocumentoId { get; set; }

    public ProductoVariante Variante { get; set; } = null!;
    public Sucursal Sucursal { get; set; } = null!;
    public Usuario Usuario { get; set; } = null!;
    public DocumentoStock? Documento { get; set; }
}
