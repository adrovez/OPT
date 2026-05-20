using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Sucursales.DTOs;

namespace OPT.Application.Sucursales.Queries;

public record GetSucursalByIdQuery(Guid SucursalId, Guid TenantId) : IRequest<SucursalDto?>;

public class GetSucursalByIdQueryHandler(ISucursalRepository repository)
    : IRequestHandler<GetSucursalByIdQuery, SucursalDto?>
{
    public async Task<SucursalDto?> Handle(GetSucursalByIdQuery query, CancellationToken ct)
    {
        var sucursal = await repository.GetByIdAsync(query.SucursalId, query.TenantId);
        return sucursal?.ToDto();
    }
}
