using MediatR;
using OPT.Application.Interfaces;
using RecetaCristalesEntity = OPT.Domain.Entities.RecetaCristales;

namespace OPT.Application.RecetaCristales.Commands;

public class CreateRecetaCristalesCommandHandler(IRecetaCristalesRepository repository)
    : IRequestHandler<CreateRecetaCristalesCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateRecetaCristalesCommand request, CancellationToken cancellationToken)
    {
        var receta = new RecetaCristalesEntity
        {
            RecetaCristalesId = Guid.NewGuid(),
            TenantId = request.TenantId,
            ClienteId = request.ClienteId,

            LejosODEsferico = request.LejosODEsferico?.Trim(),
            LejosODCilindro = request.LejosODCilindro?.Trim(),
            LejosODEje = request.LejosODEje?.Trim(),
            LejosODObservacion = request.LejosODObservacion?.Trim(),

            LejosOIEsferico = request.LejosOIEsferico?.Trim(),
            LejosOICilindro = request.LejosOICilindro?.Trim(),
            LejosOIEje = request.LejosOIEje?.Trim(),
            LejosOIObservacion = request.LejosOIObservacion?.Trim(),

            LejosDPEsferico = request.LejosDPEsferico?.Trim(),
            LejosDPObservacion = request.LejosDPObservacion?.Trim(),

            CercaODEsferico = request.CercaODEsferico?.Trim(),
            CercaODCilindro = request.CercaODCilindro?.Trim(),
            CercaODEje = request.CercaODEje?.Trim(),
            CercaODObservacion = request.CercaODObservacion?.Trim(),

            CercaOIEsferico = request.CercaOIEsferico?.Trim(),
            CercaOICilindro = request.CercaOICilindro?.Trim(),
            CercaOIEje = request.CercaOIEje?.Trim(),
            CercaOIObservacion = request.CercaOIObservacion?.Trim(),

            CercaDPEsferico = request.CercaDPEsferico?.Trim(),
            CercaDPObservacion = request.CercaDPObservacion?.Trim(),

            LejosADDEsfera = request.LejosADDEsfera?.Trim(),

            CheckLejos = request.CheckLejos,
            CheckCerca = request.CheckCerca,
            CheckCristalesLaboratorio = request.CheckCristalesLaboratorio,
            CheckUrgente = request.CheckUrgente,

            FechaIngreso = request.FechaIngreso,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.CreatedBy
        };

        var created = await repository.AddAsync(receta, cancellationToken);
        return created.RecetaCristalesId;
    }
}
