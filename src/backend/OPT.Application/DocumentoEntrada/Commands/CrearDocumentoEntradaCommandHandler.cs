using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.DocumentoEntrada.Commands;

public class CrearDocumentoEntradaCommandHandler(IDocumentoEntradaRepository repository)
    : IRequestHandler<CrearDocumentoEntradaCommand, Guid>
{
    public async Task<Guid> Handle(
        CrearDocumentoEntradaCommand request, CancellationToken cancellationToken)
        => await repository.CrearBorradorAsync(
            request.TenantId,
            request.SucursalId,
            request.TipoDocumento,
            request.NumeroDocumento,
            request.FechaDocumento,
            request.ProveedorNombre,
            request.ProveedorRut,
            request.Observaciones,
            request.Lineas,
            request.CreatedBy,
            cancellationToken);
}
