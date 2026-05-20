using MediatR;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Application.Sucursales.Commands;

public record CreateSucursalCommand(
    Guid TenantId,
    string Nombre,
    string? Direccion,
    string? Telefono,
    bool Matriz,
    string CreatedBy) : IRequest<Guid>;

public class CreateSucursalCommandHandler(ISucursalRepository repository)
    : IRequestHandler<CreateSucursalCommand, Guid>
{
    public async Task<Guid> Handle(CreateSucursalCommand cmd, CancellationToken ct)
    {
        var sucursal = new Sucursal
        {
            TenantId = cmd.TenantId,
            Nombre = cmd.Nombre.Trim(),
            Direccion = cmd.Direccion?.Trim(),
            Telefono = cmd.Telefono?.Trim(),
            Matriz = cmd.Matriz,
            FechaRegistro = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = cmd.CreatedBy
        };

        await repository.AddAsync(sucursal);
        return sucursal.SucursalId;
    }
}
