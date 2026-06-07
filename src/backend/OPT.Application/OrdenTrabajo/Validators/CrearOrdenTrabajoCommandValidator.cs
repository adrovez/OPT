using FluentValidation;
using OPT.Application.OrdenTrabajo.Commands;

namespace OPT.Application.OrdenTrabajo.Validators;

public class CrearOrdenTrabajoCommandValidator : AbstractValidator<CrearOrdenTrabajoCommand>
{
    public CrearOrdenTrabajoCommandValidator()
    {
        RuleFor(x => x.NumeroOT)
            .NotEmpty().MaximumLength(20);

        RuleFor(x => x.ClienteId)
            .NotEmpty();

        RuleFor(x => x.TipoFacturacion)
            .Must(v => v is "Particular" or "Empresa")
            .WithMessage("TipoFacturacion debe ser 'Particular' o 'Empresa'.");

        RuleFor(x => x.EmpresaClienteId)
            .NotEmpty()
            .When(x => x.TipoFacturacion == "Empresa")
            .WithMessage("EmpresaClienteId es requerido cuando TipoFacturacion es 'Empresa'.");

        RuleFor(x => x.FechaEntrega)
            .NotEmpty();

        RuleFor(x => x.Descuento)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.NumeroCuotas)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.FechaInicioCuotas)
            .NotEmpty()
            .When(x => x.NumeroCuotas > 0)
            .WithMessage("FechaInicioCuotas es requerida cuando NumeroCuotas > 0.");

        RuleFor(x => x.Lineas)
            .NotEmpty().WithMessage("La OT debe tener al menos una línea.");

        RuleForEach(x => x.Lineas)
            .ChildRules(linea =>
            {
                linea.RuleFor(l => l.ProductoId).NotEmpty();
                linea.RuleFor(l => l.Cantidad).GreaterThan(0);
                linea.RuleFor(l => l.ValorUnitario).GreaterThanOrEqualTo(0);
            });

        RuleForEach(x => x.Abonos)
            .ChildRules(abono =>
            {
                abono.RuleFor(a => a.FormaPagoId).GreaterThan(0);
                abono.RuleFor(a => a.Monto).GreaterThan(0);
            });
    }
}
