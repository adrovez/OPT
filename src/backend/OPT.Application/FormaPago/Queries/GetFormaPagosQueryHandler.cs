using MediatR;
using OPT.Application.FormaPago.DTOs;
using OPT.Application.Interfaces;

namespace OPT.Application.FormaPago.Queries;

public class GetFormaPagosQueryHandler(IFormaPagoRepository repository)
    : IRequestHandler<GetFormaPagosQuery, IReadOnlyList<FormaPagoDto>>
{
    public async Task<IReadOnlyList<FormaPagoDto>> Handle(GetFormaPagosQuery query, CancellationToken cancellationToken)
    {
        var items = await repository.GetAllAsync(cancellationToken);
        return items.Select(f => f.ToDto()).ToList();
    }
}
