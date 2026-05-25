using FluentValidation;
using OPT.Application.Stock.Commands;

namespace OPT.Application.Stock.Validators;

public class RegistrarMovimientoCommandValidator : AbstractValidator<RegistrarMovimientoCommand>
{
    private static readonly HashSet<string> TiposValidos = ["Entrada", "Salida", "Ajuste"];

    public RegistrarMovimientoCommandValidator()
    {
        RuleFor(x => x.VarianteId).NotEmpty();
        RuleFor(x => x.SucursalId).NotEmpty();
        RuleFor(x => x.TipoMovimiento)
            .NotEmpty()
            .Must(t => TiposValidos.Contains(t))
            .WithMessage("TipoMovimiento debe ser 'Entrada', 'Salida' o 'Ajuste'.");
        RuleFor(x => x.Cantidad)
            .Must((cmd, cantidad) => cmd.TipoMovimiento switch
            {
                "Entrada" => cantidad > 0,
                "Salida"  => cantidad > 0,
                "Ajuste"  => cantidad != 0,
                _         => false
            })
            .WithMessage("Entrada y Salida requieren Cantidad > 0. Ajuste requiere Cantidad ≠ 0.");
        RuleFor(x => x.Referencia).MaximumLength(100).When(x => x.Referencia is not null);
        RuleFor(x => x.Observacion).MaximumLength(500).When(x => x.Observacion is not null);
    }
}
