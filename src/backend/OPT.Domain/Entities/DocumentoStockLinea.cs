namespace OPT.Domain.Entities;

public class DocumentoStockLinea
{
    public Guid LineaId { get; set; }
    public Guid DocumentoId { get; set; }
    public Guid VarianteId { get; set; }
    public int Cantidad { get; set; }
    public decimal? PrecioCosto { get; set; }

    public DocumentoStock Documento { get; set; } = null!;
    public ProductoVariante Variante { get; set; } = null!;
}
