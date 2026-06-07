using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Prevision.DTOs;

namespace OPT.Application.Prevision.Queries;

public record GetTipoPrevisionesQuery : IRequest<IReadOnlyList<TipoPrevisionDto>>;

public class GetTipoPrevisionesQueryHandler(ITipoPrevisionRepository repository)
    : IRequestHandler<GetTipoPrevisionesQuery, IReadOnlyList<TipoPrevisionDto>>
{
    public Task<IReadOnlyList<TipoPrevisionDto>> Handle(
        GetTipoPrevisionesQuery request,
        CancellationToken cancellationToken)
        => repository.GetAllAsync(cancellationToken);
}
