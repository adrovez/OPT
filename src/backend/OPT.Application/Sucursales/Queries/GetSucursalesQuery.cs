using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Sucursales.DTOs;

namespace OPT.Application.Sucursales.Queries;

public record GetSucursalesQuery(Guid TenantId) : IRequest<IReadOnlyList<SucursalDto>>;

public class GetSucursalesQueryHandler(ISucursalRepository repository)
    : IRequestHandler<GetSucursalesQuery, IReadOnlyList<SucursalDto>>
{
    public async Task<IReadOnlyList<SucursalDto>> Handle(GetSucursalesQuery query, CancellationToken ct)
    {
        var sucursales = await repository.GetAllAsync(query.TenantId);
        return sucursales.Select(s => s.ToDto()).ToList();
    }
}
