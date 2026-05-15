using MediatR;
using OPT.Application.Anamnesis.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.Anamnesis.Queries;

public class GetAnamnesisQueryHandler(IAnamnesisRepository repository)
    : IRequestHandler<GetAnamnesisQuery, AnamnesisDto?>
{
    public async Task<AnamnesisDto?> Handle(
        GetAnamnesisQuery request, CancellationToken cancellationToken)
    {
        var anamnesis = await repository.GetByIdAsync(
            request.AnamnesisId, request.TenantId, cancellationToken);

        return anamnesis?.ToDto();
    }
}
