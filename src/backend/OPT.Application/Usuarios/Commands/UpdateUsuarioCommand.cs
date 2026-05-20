using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Usuarios.Commands;

public record UpdateUsuarioCommand(
    Guid UsuarioId,
    Guid TenantId,
    string Nombre,
    string Email,
    string Rol,
    string UpdatedBy) : IRequest;

public class UpdateUsuarioCommandHandler(IUsuarioRepository repository)
    : IRequestHandler<UpdateUsuarioCommand>
{
    public async Task Handle(UpdateUsuarioCommand cmd, CancellationToken ct)
    {
        var usuario = await repository.GetByIdAsync(cmd.UsuarioId, cmd.TenantId, ct)
            ?? throw new KeyNotFoundException($"Usuario {cmd.UsuarioId} no encontrado.");

        usuario.Nombre    = cmd.Nombre.Trim();
        usuario.Email     = cmd.Email.Trim().ToLowerInvariant();
        usuario.Rol       = cmd.Rol;
        usuario.UpdatedAt = DateTime.UtcNow;
        usuario.UpdatedBy = cmd.UpdatedBy;

        await repository.UpdateAsync(usuario, ct);
    }
}
