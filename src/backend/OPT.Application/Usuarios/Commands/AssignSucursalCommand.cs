using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Usuarios.Commands;

public record AssignSucursalCommand(
    Guid UsuarioId,
    Guid TenantId,
    Guid SucursalId,
    string AssignedBy) : IRequest;

public class AssignSucursalCommandHandler(IUsuarioRepository repository)
    : IRequestHandler<AssignSucursalCommand>
{
    public async Task Handle(AssignSucursalCommand cmd, CancellationToken ct)
    {
        var usuario = await repository.GetByIdAsync(cmd.UsuarioId, cmd.TenantId, ct)
            ?? throw new KeyNotFoundException($"Usuario {cmd.UsuarioId} no encontrado.");

        var yaAsignada = await repository.ExistsSucursalAssignmentAsync(cmd.UsuarioId, cmd.SucursalId, ct);
        if (yaAsignada)
            throw new InvalidOperationException(
                $"La sucursal {cmd.SucursalId} ya está asignada al usuario {cmd.UsuarioId}.");

        await repository.AssignSucursalAsync(cmd.UsuarioId, cmd.SucursalId, cmd.AssignedBy, ct);
    }
}
