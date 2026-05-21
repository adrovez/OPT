using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Roles.DTOs;

namespace OPT.Application.Roles.Queries;

public class GetRolesQueryHandler(IRolRepository rolRepository)
    : IRequestHandler<GetRolesQuery, IReadOnlyList<RolDto>>
{
    public async Task<IReadOnlyList<RolDto>> Handle(
        GetRolesQuery request, CancellationToken cancellationToken)
    {
        var roles = await rolRepository.GetAllAsync(cancellationToken);
        return roles.Select(r => r.ToDto()).ToList();
    }
}
