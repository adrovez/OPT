using FluentValidation;
using OPT.Application.OrdenTrabajo.Commands;

namespace OPT.Application.OrdenTrabajo.Validators;

public class CambiarEtapaOTCommandValidator : AbstractValidator<CambiarEtapaOTCommand>
{
    private static readonly string[] EtapasValidas =
        ["Ingresado", "EnProceso", "Montaje", "Laboratorio", "Calidad", "Despacho", "Entregado"];

    public CambiarEtapaOTCommandValidator()
    {
        RuleFor(x => x.OTId)
            .NotEmpty();

        RuleFor(x => x.NuevaEtapa)
            .Must(v => EtapasValidas.Contains(v))
            .WithMessage($"NuevaEtapa debe ser una de: {string.Join(", ", EtapasValidas)}.");

        RuleFor(x => x.Responsable)
            .NotEmpty();
    }
}
