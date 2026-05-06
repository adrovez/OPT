namespace OPT.Infrastructure.Auth;

/// <summary>Configuración JWT leída desde appsettings.json sección "Jwt".</summary>
public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 60;
}
