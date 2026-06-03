using FluentValidation;
using OPT.Application.Transferencia.Commands;

namespace OPT.Application.Transferencia.Validators;

public class CrearTransferenciaCommandValidator : AbstractValidator<CrearTransferenciaCommand>
{
    public CrearTransferenciaCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.SucursalOrigenId).NotEmpty();
        RuleFor(x => x.SucursalDestinoId)
            .NotEmpty()
            .NotEqual(x => x.SucursalOrigenId)
            .WithMessage("La sucursal de destino no puede ser igual a la de origen.");
        RuleFor(x => x.Observaciones).MaximumLength(500).When(x => x.Observaciones is not null);
        RuleFor(x => x.Lineas).NotEmpty().WithMessage("La transferencia debe tener al menos una línea.");
        RuleForEach(x => x.Lineas).ChildRules(l =>
        {
            l.RuleFor(x => x.ProductoId).NotEmpty();
            l.RuleFor(x => x.Cantidad).GreaterThan(0);
        });
        RuleFor(x => x.CreatedBy).NotEmpty();
    }
}
