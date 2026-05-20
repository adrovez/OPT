using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Usuarios.Commands;

public record RemoveSucursalCommand(
    Guid UsuarioId,
    Guid TenantId,
    Guid SucursalId) : IRequest;

public class RemoveSucursalCommandHandler(IUsuarioRepository repository)
    : IRequestHandler<RemoveSucursalCommand>
{
    public async Task Handle(RemoveSucursalCommand cmd, CancellationToken ct)
    {
        var usuario = await repository.GetByIdAsync(cmd.UsuarioId, cmd.TenantId, ct)
            ?? throw new KeyNotFoundException($"Usuario {cmd.UsuarioId} no encontrado.");

        var existe = await repository.ExistsSucursalAssignmentAsync(cmd.UsuarioId, cmd.SucursalId, ct);
        if (!existe)
            throw new KeyNotFoundException(
                $"La sucursal {cmd.SucursalId} no está asignada al usuario {cmd.UsuarioId}.");

        await repository.RemoveSucursalAsync(cmd.UsuarioId, cmd.SucursalId, ct);
    }
}
