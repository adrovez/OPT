using FluentValidation;
using OPT.Application.RecetaCristales.Commands;

namespace OPT.Application.RecetaCristales.Validators;

public class CreateRecetaCristalesCommandValidator : AbstractValidator<CreateRecetaCristalesCommand>
{
    public CreateRecetaCristalesCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId inválido.");

        RuleFor(x => x.ClienteId)
            .NotEmpty().WithMessage("ClienteId inválido.");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("CreatedBy es requerido.");

        // Campos de texto corto (máx 10 chars, igual que NVARCHAR(10) en SQL)
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

        // Observaciones (máx 200 chars, igual que NVARCHAR(200) en SQL)
        ApplyMaxLength(x => x.LejosODObservacion, 200);
        ApplyMaxLength(x => x.LejosOIObservacion, 200);
        ApplyMaxLength(x => x.LejosDPObservacion, 200);
        ApplyMaxLength(x => x.CercaODObservacion, 200);
        ApplyMaxLength(x => x.CercaOIObservacion, 200);
        ApplyMaxLength(x => x.CercaDPObservacion, 200);
    }

    private void ApplyMaxLength(
        System.Linq.Expressions.Expression<System.Func<CreateRecetaCristalesCommand, string?>> selector,
        int max)
    {
        RuleFor(selector)
            .MaximumLength(max)
            .When(x => selector.Compile()(x) is not null);
    }
}
