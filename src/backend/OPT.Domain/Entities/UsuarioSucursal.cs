namespace OPT.Domain.Entities;

/// <summary>
/// Entidad pivote M:N entre Usuario y Sucursal.
/// Representa el acceso de un usuario a una sucursal del tenant.
/// </summary>
public class UsuarioSucursal
{
    public Guid UsuarioId { get; set; }
    public Guid SucursalId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public string? AssignedBy { get; set; }

    // Navigation
    public Usuario? Usuario { get; set; }
    public Sucursal? Sucursal { get; set; }
}
