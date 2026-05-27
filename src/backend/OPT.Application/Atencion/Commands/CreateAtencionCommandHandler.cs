using MediatR;
using OPT.Application.Interfaces;
using AtencionEntity = OPT.Domain.Entities.Atencion;

namespace OPT.Application.Atencion.Commands;

public class CreateAtencionCommandHandler(
    IAtencionRepository atencionRepository,
    IAgendaRepository agendaRepository)
    : IRequestHandler<CreateAtencionCommand, Guid>
{
    public async Task<Guid> Handle(CreateAtencionCommand request, CancellationToken cancellationToken)
    {
        // RN-AT-02: si proviene de Agenda, marcarla como Atendida
        if (request.AgendaId.HasValue)
        {
            var agenda = await agendaRepository.GetByIdAsync(
                request.AgendaId.Value, request.TenantId, cancellationToken)
                ?? throw new KeyNotFoundException($"Agenda {request.AgendaId} no encontrada.");

            agenda.Estado    = "Atendida";
            agenda.UpdatedAt = DateTime.UtcNow;
            agenda.UpdatedBy = request.CreatedBy;
            await agendaRepository.UpdateAsync(agenda, cancellationToken);
        }

        var atencion = new AtencionEntity
        {
            TenantId          = request.TenantId,
            SucursalId        = request.SucursalId,
            AgendaId          = request.AgendaId,
            ClienteId         = request.ClienteId,
            UsuarioAtencionId = request.UsuarioAtencionId,
            FechaHoraAtencion = request.FechaHoraAtencion,
            Motivo            = request.Motivo,
            Observaciones     = request.Observaciones,
            Estado            = "Abierta",
            CreatedBy         = request.CreatedBy
        };

        await atencionRepository.AddAsync(atencion, cancellationToken);
        return atencion.AtencionId;
    }
}
