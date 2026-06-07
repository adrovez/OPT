using MediatR;
using OPT.Application.Interfaces;
using OTEntity = OPT.Domain.Entities.OrdenTrabajo;

namespace OPT.Application.OrdenTrabajo.Queries;

public record VerificarNumeroOTQuery(
    string NumeroOT,
    Guid TenantId,
    Guid? ExcluirOTId = null) : IRequest<bool>;

public class VerificarNumeroOTQueryHandler(IOrdenTrabajoRepository repository)
    : IRequestHandler<VerificarNumeroOTQuery, bool>
{
    public async Task<bool> Handle(VerificarNumeroOTQuery q, CancellationToken ct)
        => await repository.ExisteNumeroOTAsync(q.NumeroOT, q.TenantId, q.ExcluirOTId, ct);
}
