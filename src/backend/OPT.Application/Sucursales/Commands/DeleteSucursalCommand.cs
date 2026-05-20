using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Sucursales.Commands;

public record DeleteSucursalCommand(
    Guid SucursalId,
    Guid TenantId,
    string DeletedBy) : IRequest;

public class DeleteSucursalCommandHandler(ISucursalRepository repository)
    : IRequestHandler<DeleteSucursalCommand>
{
    public async Task Handle(DeleteSucursalCommand cmd, CancellationToken ct)
        => await repository.SoftDeleteAsync(cmd.SucursalId, cmd.TenantId, cmd.DeletedBy);
}
