namespace OPT.Domain.Entities;

/// <summary>
/// Catálogo de tipos de previsión de salud.
/// Dato compartido (sin TenantId, sin IsDeleted). Solo lectura.
/// </summary>
public class TipoPrevision
{
    public int IdTipoPrevision { get; set; }
    public string Descripcion { get; set; } = string.Empty;
}
