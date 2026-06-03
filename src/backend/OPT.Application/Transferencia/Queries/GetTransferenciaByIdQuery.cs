using MediatR;
using OPT.Application.Interfaces;
using OPT.Application.Transferencia.DTOs;

namespace OPT.Application.Transferencia.Queries;

public record GetTransferenciaByIdQuery(
    Guid TenantId, Guid TransferenciaId) : IRequest<TransferenciaDto?>;

public class GetTransferenciaByIdQueryHandler(ITransferenciaRepository repository)
    : IRequestHandler<GetTransferenciaByIdQuery, TransferenciaDto?>
{
    public async Task<TransferenciaDto?> Handle(
        GetTransferenciaByIdQuery request, CancellationToken cancellationToken)
    {
        var t = await repository.GetByIdAsync(
            request.TenantId, request.TransferenciaId, cancellationToken);
        return t?.ToDto();
    }
}
