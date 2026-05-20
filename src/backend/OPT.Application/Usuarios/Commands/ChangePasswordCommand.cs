using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Usuarios.Commands;

public record ChangePasswordCommand(
    Guid UsuarioId,
    Guid TenantId,
    string NewPassword,
    string UpdatedBy) : IRequest;

public class ChangePasswordCommandHandler(
    IUsuarioRepository repository,
    IPasswordHasher passwordHasher)
    : IRequestHandler<ChangePasswordCommand>
{
    public async Task Handle(ChangePasswordCommand cmd, CancellationToken ct)
    {
        var usuario = await repository.GetByIdAsync(cmd.UsuarioId, cmd.TenantId, ct)
            ?? throw new KeyNotFoundException($"Usuario {cmd.UsuarioId} no encontrado.");

        usuario.PasswordHash = passwordHasher.Hash(cmd.NewPassword);
        usuario.UpdatedAt    = DateTime.UtcNow;
        usuario.UpdatedBy    = cmd.UpdatedBy;

        await repository.UpdateAsync(usuario, ct);
    }
}
