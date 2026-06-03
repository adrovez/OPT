namespace OPT.Domain.Entities;

public class DocumentoEntradaLinea
{
    public Guid LineaId { get; set; }
    public Guid TenantId { get; set; }
    public Guid DocumentoId { get; set; }
    public Guid ProductoId { get; set; }
    public int Cantidad { get; set; }
    public decimal? PrecioCosto { get; set; }
    public string? Observaciones { get; set; }

    // Sin IsDeleted, sin audit (cascade desde DocumentoEntrada)
    public DocumentoEntrada Documento { get; set; } = null!;
    public Producto Producto { get; set; } = null!;
}
