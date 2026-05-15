using MediatR;
using OPT.Application.Anamnesis.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Anamnesis.Queries;

public class GetAnamnesisByClienteQueryHandler(IAnamnesisRepository repository)
    : IRequestHandler<GetAnamnesisByClienteQuery, IReadOnlyList<AnamnesisDto>>
{
    public async Task<IReadOnlyList<AnamnesisDto>> Handle(
        GetAnamnesisByClienteQuery request, CancellationToken cancellationToken)
    {
        var items = await repository.GetByClienteAsync(
            request.ClienteId, request.TenantId, cancellationToken);

        return items.Select(a => a.ToDto()).ToList();
    }
}
