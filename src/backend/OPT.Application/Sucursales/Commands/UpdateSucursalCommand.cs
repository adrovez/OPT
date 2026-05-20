using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Sucursales.Commands;

public record UpdateSucursalCommand(
    Guid SucursalId,
    Guid TenantId,
    string Nombre,
    string? Direccion,
    string? Telefono,
    bool Matriz,
    string UpdatedBy) : IRequest;

public class UpdateSucursalCommandHandler(ISucursalRepository repository)
    : IRequestHandler<UpdateSucursalCommand>
{
    public async Task Handle(UpdateSucursalCommand cmd, CancellationToken ct)
    {
        var sucursal = await repository.GetByIdAsync(cmd.SucursalId, cmd.TenantId)
            ?? throw new KeyNotFoundException($"Sucursal {cmd.SucursalId} no encontrada.");

        sucursal.Nombre = cmd.Nombre.Trim();
        sucursal.Direccion = cmd.Direccion?.Trim();
        sucursal.Telefono = cmd.Telefono?.Trim();
        sucursal.Matriz = cmd.Matriz;
        sucursal.UpdatedAt = DateTime.UtcNow;
        sucursal.UpdatedBy = cmd.UpdatedBy;

        await repository.UpdateAsync(sucursal);
    }
}
