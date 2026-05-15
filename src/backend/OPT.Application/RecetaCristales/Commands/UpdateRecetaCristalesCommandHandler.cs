using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.RecetaCristales.Commands;

public class UpdateRecetaCristalesCommandHandler(IRecetaCristalesRepository repository)
    : IRequestHandler<UpdateRecetaCristalesCommand>
{
    public async Task Handle(
        UpdateRecetaCristalesCommand request, CancellationToken cancellationToken)
    {
        var receta = await repository.GetByIdAsync(
            request.RecetaCristalesId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException(
                $"RecetaCristales {request.RecetaCristalesId} no encontrada.");

        receta.LejosODEsferico = request.LejosODEsferico?.Trim();
        receta.LejosODCilindro = request.LejosODCilindro?.Trim();
        receta.LejosODEje = request.LejosODEje?.Trim();
        receta.LejosODObservacion = request.LejosODObservacion?.Trim();

        receta.LejosOIEsferico = request.LejosOIEsferico?.Trim();
        receta.LejosOICilindro = request.LejosOICilindro?.Trim();
        receta.LejosOIEje = request.LejosOIEje?.Trim();
        receta.LejosOIObservacion = request.LejosOIObservacion?.Trim();

        receta.LejosDPEsferico = request.LejosDPEsferico?.Trim();
        receta.LejosDPObservacion = request.LejosDPObservacion?.Trim();

        receta.CercaODEsferico = request.CercaODEsferico?.Trim();
        receta.CercaODCilindro = request.CercaODCilindro?.Trim();
        receta.CercaODEje = request.CercaODEje?.Trim();
        receta.CercaODObservacion = request.CercaODObservacion?.Trim();

        receta.CercaOIEsferico = request.CercaOIEsferico?.Trim();
        receta.CercaOICilindro = request.CercaOICilindro?.Trim();
        receta.CercaOIEje = request.CercaOIEje?.Trim();
        receta.CercaOIObservacion = request.CercaOIObservacion?.Trim();

        receta.CercaDPEsferico = request.CercaDPEsferico?.Trim();
        receta.CercaDPObservacion = request.CercaDPObservacion?.Trim();

        receta.LejosADDEsfera = request.LejosADDEsfera?.Trim();

        receta.CheckLejos = request.CheckLejos;
        receta.CheckCerca = request.CheckCerca;
        receta.CheckCristalesLaboratorio = request.CheckCristalesLaboratorio;
        receta.CheckUrgente = request.CheckUrgente;

        receta.FechaIngreso = request.FechaIngreso;
        receta.UpdatedAt = DateTime.UtcNow;
        receta.UpdatedBy = request.UpdatedBy;

        await repository.UpdateAsync(receta, cancellationToken);
    }
}
