using FluentValidation;
using OPT.Application.RecetaCristales.Commands;

namespace OPT.Application.RecetaCristales.Validators;

public class UpdateRecetaCristalesCommandValidator : AbstractValidator<UpdateRecetaCristalesCommand>
{
    public UpdateRecetaCristalesCommandValidator()
    {
        RuleFor(x => x.RecetaCristalesId)
            .NotEmpty().WithMessage("RecetaCristalesId inválido.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId inválido.");

        RuleFor(x => x.UpdatedBy)
            .NotEmpty().WithMessage("UpdatedBy es requerido.");

        ApplyMaxLength(x => x.LejosODEsferico, 10);
        ApplyMaxLength(x => x.LejosODCilindro, 10);
        ApplyMaxLength(x => x.LejosODEje, 10);
        ApplyMaxLength(x => x.LejosOIEsferico, 10);
        ApplyMaxLength(x => x.LejosOICilindro, 10);
        ApplyMaxLength(x => x.LejosOIEje, 10);
        ApplyMaxLength(x => x.LejosDPEsferico, 10);
        ApplyMaxLength(x => x.CercaODEsferico, 10);
        ApplyMaxLength(x => x.CercaODCilindro, 10);
        ApplyMaxLength(x => x.CercaODEje, 10);
        ApplyMaxLength(x => x.CercaOIEsferico, 10);
        ApplyMaxLength(x => x.CercaOICilindro, 10);
        ApplyMaxLength(x => x.CercaOIEje, 10);
        ApplyMaxLength(x => x.CercaDPEsferico, 10);
        ApplyMaxLength(x => x.LejosADDEsfera, 10);

        ApplyMaxLength(x => x.LejosODObservacion, 200);
        ApplyMaxLength(x => x.LejosOIObservacion, 200);
        ApplyMaxLength(x => x.LejosDPObservacion, 200);
        ApplyMaxLength(x => x.CercaODObservacion, 200);
        ApplyMaxLength(x => x.CercaOIObservacion, 200);
        ApplyMaxLength(x => x.CercaDPObservacion, 200);
    }

    private void ApplyMaxLength(
        System.Linq.Expressions.Expression<System.Func<UpdateRecetaCristalesCommand, string?>> selector,
        int max)
    {
        RuleFor(selector)
            .MaximumLength(max)
            .When(x => selector.Compile()(x) is not null);
    }
}
