using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Usuarios.Commands;

public record DeleteUsuarioCommand(
    Guid UsuarioId,
    Guid TenantId,
    string DeletedBy) : IRequest;

public class DeleteUsuarioCommandHandler(IUsuarioRepository repository)
    : IRequestHandler<DeleteUsuarioCommand>
{
    public async Task Handle(DeleteUsuarioCommand cmd, CancellationToken ct)
        => await repository.SoftDeleteAsync(cmd.UsuarioId, cmd.TenantId, cmd.DeletedBy, ct);
}
