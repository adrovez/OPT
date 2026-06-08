using MediatR;

namespace OPT.Application.Auth;

/// <summary>Comando para renovar el par JWT + refresh token usando un refresh token válido.</summary>
public record RefreshTokenCommand(string RefreshToken, Guid TenantId) : IRequest<LoginResponse>;
