using RecetaCristalesEntity = OPT.Domain.Entities.RecetaCristales;

namespace OPT.Application.RecetaCristales.DTOs;

public static class RecetaCristalesMappingExtensions
{
    public static RecetaCristalesDto ToDto(this RecetaCristalesEntity r) => new(
        r.RecetaCristalesId,
        r.TenantId,
        r.ClienteId,

        r.LejosODEsferico,
        r.LejosODCilindro,
        r.LejosODEje,
        r.LejosODObservacion,

        r.LejosOIEsferico,
        r.LejosOICilindro,
        r.LejosOIEje,
        r.LejosOIObservacion,

        r.LejosDPEsferico,
        r.LejosDPObservacion,

        r.CercaODEsferico,
        r.CercaODCilindro,
        r.CercaODEje,
        r.CercaODObservacion,

        r.CercaOIEsferico,
        r.CercaOICilindro,
        r.CercaOIEje,
        r.CercaOIObservacion,

        r.CercaDPEsferico,
        r.CercaDPObservacion,

        r.LejosADDEsfera,

        r.CheckLejos,
        r.CheckCerca,
        r.CheckCristalesLaboratorio,
        r.CheckUrgente,

        r.FechaIngreso,
        r.CreatedAt,
        r.UpdatedAt,
        r.CreatedBy,
        r.UpdatedBy);
}
