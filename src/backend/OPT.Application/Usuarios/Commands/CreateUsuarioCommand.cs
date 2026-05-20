using MediatR;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Application.Usuarios.Commands;

public record CreateUsuarioCommand(
    Guid TenantId,
    string RutUsuario,
    string Nombre,
    string Email,
    string Password,
    string Rol,
    string CreatedBy) : IRequest<Guid>;

public class CreateUsuarioCommandHandler(
    IUsuarioRepository repository,
    IPasswordHasher passwordHasher)
    : IRequestHandler<CreateUsuarioCommand, Guid>
{
    public async Task<Guid> Handle(CreateUsuarioCommand cmd, CancellationToken ct)
    {
        var usuario = new Usuario
        {
            TenantId   = cmd.TenantId,
            RutUsuario = cmd.RutUsuario.Trim(),
            Nombre     = cmd.Nombre.Trim(),
            Email      = cmd.Email.Trim().ToLowerInvariant(),
            PasswordHash = passwordHasher.Hash(cmd.Password),
            Rol          = cmd.Rol,
            FechaIngreso = DateTime.UtcNow,
            CreatedAt    = DateTime.UtcNow,
            CreatedBy    = cmd.CreatedBy
        };

        await repository.AddAsync(usuario, ct);
        return usuario.UsuarioId;
    }
}
