namespace OPT.Domain.Entities;

public class MovimientoStock
{
    public Guid MovimientoId { get; set; }
    public Guid TenantId { get; set; }
    public Guid ProductoId { get; set; }
    public Guid SucursalId { get; set; }
    public Guid UsuarioId { get; set; }

    /// <summary>'Entrada'|'Salida'|'Ajuste'|'Merma'|'DevolucionProveedor'|'TransferenciaEntrada'|'TransferenciaSalida'</summary>
    public string TipoMovimiento { get; set; } = string.Empty;

    public int Cantidad { get; set; }
    public int CantidadAntes { get; set; }
    public int CantidadDespues { get; set; }

    /// <summary>FK nullable a OPT_DocumentoEntrada.</summary>
    public Guid? DocumentoId { get; set; }

    /// <summary>FK nullable a OPT_Transferencia.</summary>
    public Guid? TransferenciaId { get; set; }

    public string? Referencia { get; set; }
    public string? Observacion { get; set; }

    public DateTime FechaMovimiento { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }

    // Sin IsDeleted, sin UpdatedAt/UpdatedBy — los movimientos son inmutables

    public Producto Producto { get; set; } = null!;
    public Sucursal Sucursal { get; set; } = null!;
    public Usuario Usuario { get; set; } = null!;
    public DocumentoEntrada? Documento { get; set; }
    public Transferencia? Transferencia { get; set; }
}
