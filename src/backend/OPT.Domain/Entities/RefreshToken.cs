namespace OPT.Domain.Entities;

/// <summary>
/// Refresh token persistido para rotación de JWT.
/// Se almacena el hash SHA-256 del token en texto plano, nunca el token crudo.
/// Un token está activo cuando no está revocado ni expirado.
/// </summary>
public class RefreshToken
{
    public Guid RefreshTokenId { get; set; }
    public Guid UsuarioId { get; set; }
    public Guid TenantId { get; set; }

    /// <summary>SHA-256 hex del token crudo. Nunca almacenar el token en claro.</summary>
    public string TokenHash { get; set; } = string.Empty;

    public DateTime FechaExpiracion { get; set; }
    public DateTime? FechaRevocacion { get; set; }
    public DateTime CreatedAt { get; set; }

    public bool IsRevoked  => FechaRevocacion.HasValue;
    public bool IsExpired  => DateTime.UtcNow >= FechaExpiracion;
    public bool IsActive   => !IsRevoked && !IsExpired;

    // Navegación
    public Usuario? Usuario { get; set; }
}
