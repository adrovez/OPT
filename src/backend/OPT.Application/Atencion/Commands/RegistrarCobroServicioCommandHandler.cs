using MediatR;
using OPT.Application.Interfaces;
using CobroServicioEntity = OPT.Domain.Entities.CobroServicio;

namespace OPT.Application.Atencion.Commands;

public class RegistrarCobroServicioCommandHandler(
    IAtencionRepository atencionRepository,
    ICobroServicioRepository cobroRepository)
    : IRequestHandler<RegistrarCobroServicioCommand, Guid>
{
    public async Task<Guid> Handle(RegistrarCobroServicioCommand request, CancellationToken cancellationToken)
    {
        var atencion = await atencionRepository.GetByIdAsync(
            request.AtencionId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException($"Atención {request.AtencionId} no encontrada.");

        // RN-CS-01: solo se cobra en TerminadaServicio
        if (atencion.Estado != "TerminadaServicio")
            throw new InvalidOperationException(
                $"Solo se puede registrar cobro en una Atención en estado 'TerminadaServicio'. Estado actual: '{atencion.Estado}'.");

        // RN-CS-01: exactamente un cobro por atención
        var existente = await cobroRepository.GetByAtencionIdAsync(
            request.AtencionId, request.TenantId, cancellationToken);
        if (existente is not null)
            throw new InvalidOperationException(
                $"La Atención {request.AtencionId} ya tiene un cobro registrado.");

        var cobro = new CobroServicioEntity
        {
            TenantId      = request.TenantId,
            SucursalId    = request.SucursalId,
            AtencionId    = request.AtencionId,
            FormaPagoId   = request.FormaPagoId,
            Monto         = request.Monto,
            FechaCobro    = DateTime.UtcNow,
            Observaciones = request.Observaciones,
            CreatedBy     = request.CreatedBy
        };

        await cobroRepository.AddAsync(cobro, cancellationToken);
        return cobro.CobroServicioId;
    }
}
