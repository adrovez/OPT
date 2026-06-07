using FluentValidation;
using OPT.Application.OrdenTrabajo.Commands;

namespace OPT.Application.OrdenTrabajo.Validators;

public class RegistrarPagoOTCommandValidator : AbstractValidator<RegistrarPagoOTCommand>
{
    public RegistrarPagoOTCommandValidator()
    {
        RuleFor(x => x.OTId)
            .NotEmpty();

        RuleFor(x => x.FormaPagoId)
            .GreaterThan(0);

        RuleFor(x => x.Monto)
            .GreaterThan(0);

        RuleFor(x => x.CreatedBy)
            .NotEmpty();
    }
}
