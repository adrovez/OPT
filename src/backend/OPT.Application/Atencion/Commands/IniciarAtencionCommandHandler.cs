using MediatR;
using OPT.Application.Interfaces;
using AtencionEntity = OPT.Domain.Entities.Atencion;
using AnamnesisEntity = OPT.Domain.Entities.Anamnesis;
using RecetaEntity    = OPT.Domain.Entities.RecetaCristales;

namespace OPT.Application.Atencion.Commands;

public class IniciarAtencionCommandHandler(
    IAtencionRepository    atencionRepo,
    IAgendaRepository      agendaRepo,
    IAnamnesisRepository   anamnesisRepo,
    IRecetaCristalesRepository recetaRepo)
    : IRequestHandler<IniciarAtencionCommand, IniciarAtencionResult>
{
    public async Task<IniciarAtencionResult> Handle(IniciarAtencionCommand cmd, CancellationToken ct)
    {
        // 1. Validar y actualizar estado de la cita
        if (cmd.AgendaId.HasValue)
        {
            var agenda = await agendaRepo.GetByIdAsync(cmd.AgendaId.Value, cmd.TenantId, ct)
                ?? throw new KeyNotFoundException($"Cita {cmd.AgendaId} no encontrada.");

            if (agenda.Estado != "Ingresado" && agenda.Estado != "Confirmada")
                throw new InvalidOperationException(
                    "La cita debe estar en estado 'Ingresado' o 'Confirmada' para iniciar la atención.");

            agenda.Estado    = "Atendida";
            agenda.UpdatedAt = DateTime.UtcNow;
            agenda.UpdatedBy = cmd.CreatedBy;
            await agendaRepo.UpdateAsync(agenda, ct);
        }

        // 2. Crear Atención
        var atencion = new AtencionEntity
        {
            TenantId          = cmd.TenantId,
            SucursalId        = cmd.SucursalId,
            AgendaId          = cmd.AgendaId,
            ClienteId         = cmd.ClienteId,
            UsuarioAtencionId = cmd.UsuarioAtencionId,
            FechaHoraAtencion = cmd.FechaHoraAtencion,
            Motivo            = cmd.Motivo,
            Observaciones     = cmd.Observaciones,
            Estado            = "Abierta",
            CreatedBy         = cmd.CreatedBy,
        };
        await atencionRepo.AddAsync(atencion, ct);

        // 3. Crear Anamnesis vinculada
        var anamnesis = new AnamnesisEntity
        {
            TenantId      = cmd.TenantId,
            ClienteId     = cmd.ClienteId,
            Hipertension  = cmd.Hipertension,
            Diabetes      = cmd.Diabetes,
            Alergias      = cmd.Alergias,
            UsaLentes     = cmd.UsaLentes,
            Observacion   = cmd.AnamnesisObservacion,
            FechaRegistro = DateTime.UtcNow,
            CreatedBy     = cmd.CreatedBy,
        };
        var savedAnamnesis = await anamnesisRepo.AddAsync(anamnesis, ct);

        // 4. Crear RecetaCristales vinculada
        var receta = new RecetaEntity
        {
            TenantId                  = cmd.TenantId,
            ClienteId                 = cmd.ClienteId,
            Fuente                    = "Consulta",
            LejosODEsferico           = cmd.LejosODEsferico,
            LejosODCilindro           = cmd.LejosODCilindro,
            LejosODEje                = cmd.LejosODEje,
            LejosODObservacion        = cmd.LejosODObservacion,
            LejosOIEsferico           = cmd.LejosOIEsferico,
            LejosOICilindro           = cmd.LejosOICilindro,
            LejosOIEje                = cmd.LejosOIEje,
            LejosOIObservacion        = cmd.LejosOIObservacion,
            LejosDPEsferico           = cmd.LejosDPEsferico,
            LejosDPObservacion        = cmd.LejosDPObservacion,
            CercaODEsferico           = cmd.CercaODEsferico,
            CercaODCilindro           = cmd.CercaODCilindro,
            CercaODEje                = cmd.CercaODEje,
            CercaODObservacion        = cmd.CercaODObservacion,
            CercaOIEsferico           = cmd.CercaOIEsferico,
            CercaOICilindro           = cmd.CercaOICilindro,
            CercaOIEje                = cmd.CercaOIEje,
            CercaOIObservacion        = cmd.CercaOIObservacion,
            CercaDPEsferico           = cmd.CercaDPEsferico,
            CercaDPObservacion        = cmd.CercaDPObservacion,
            LejosADDEsfera            = cmd.LejosADDEsfera,
            CheckLejos                = cmd.CheckLejos,
            CheckCerca                = cmd.CheckCerca,
            CheckCristalesLaboratorio = cmd.CheckCristalesLaboratorio,
            CheckUrgente              = cmd.CheckUrgente,
            FechaIngreso              = DateTime.UtcNow,
            CreatedBy                 = cmd.CreatedBy,
        };
        var savedReceta = await recetaRepo.AddAsync(receta, ct);

        // 5. Vincular Anamnesis y Receta en la Atención
        atencion.AnamnesisId       = savedAnamnesis.AnamnesisId;
        atencion.RecetaCristalesId = savedReceta.RecetaCristalesId;
        await atencionRepo.UpdateAsync(atencion, ct);

        return new IniciarAtencionResult(
            AtencionId:        atencion.AtencionId,
            AnamnesisId:       savedAnamnesis.AnamnesisId,
            RecetaCristalesId: savedReceta.RecetaCristalesId);
    }
}
