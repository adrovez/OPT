namespace OPT.Domain.Entities;

/// <summary>
/// Catálogo de roles del sistema.
/// Dato compartido (sin TenantId). Valores fijos: Admin, Operador, Lectura.
/// </summary>
public class Rol
{
    public int RolId { get; set; }
    public string Nombre { get; set; } = string.Empty;
}
