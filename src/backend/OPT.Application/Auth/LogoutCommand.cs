using MediatR;

namespace OPT.Application.Auth;

/// <summary>Comando para revocar el refresh token activo del usuario (logout).</summary>
public record LogoutCommand(string RefreshToken, Guid TenantId) : IRequest;
