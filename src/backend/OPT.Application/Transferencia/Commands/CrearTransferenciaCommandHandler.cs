using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Transferencia.Commands;

public class CrearTransferenciaCommandHandler(ITransferenciaRepository repository)
    : IRequestHandler<CrearTransferenciaCommand, Guid>
{
    public async Task<Guid> Handle(
        CrearTransferenciaCommand request, CancellationToken cancellationToken)
        => await repository.CrearAsync(
            request.TenantId,
            request.SucursalOrigenId,
            request.SucursalDestinoId,
            request.FechaTransferencia,
            request.Observaciones,
            request.Lineas,
            request.UsuarioId,
            request.CreatedBy,
            cancellationToken);
}
