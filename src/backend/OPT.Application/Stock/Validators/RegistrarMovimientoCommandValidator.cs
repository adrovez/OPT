using FluentValidation;
using OPT.Application.Stock.Commands;

namespace OPT.Application.Stock.Validators;

public class RegistrarMovimientoCommandValidator : AbstractValidator<RegistrarMovimientoCommand>
{
    // Entrada solo se crea desde DocumentoEntrada, no directamente
    private static readonly HashSet<string> TiposPermitidos =
        ["Salida", "Ajuste", "Merma", "DevolucionProveedor"];

    public RegistrarMovimientoCommandValidator()
    {
        RuleFor(x => x.ProductoId).NotEmpty();
        RuleFor(x => x.SucursalId).NotEmpty();
        RuleFor(x => x.TipoMovimiento)
            .NotEmpty()
            .Must(t => TiposPermitidos.Contains(t))
            .WithMessage("TipoMovimiento debe ser 'Salida', 'Ajuste', 'Merma' o 'DevolucionProveedor'. Las entradas se registran via DocumentoEntrada.");
        RuleFor(x => x.Cantidad)
            .Must((cmd, cantidad) => cmd.TipoMovimiento switch
            {
                "Ajuste"             => cantidad != 0,
                "Salida"             => cantidad > 0,
                "Merma"              => cantidad > 0,
                "DevolucionProveedor" => cantidad > 0,
                _                    => false
            })
            .WithMessage("Ajuste requiere Cantidad ≠ 0. Salida/Merma/DevolucionProveedor requieren Cantidad > 0.");
        RuleFor(x => x.Referencia).MaximumLength(100).When(x => x.Referencia is not null);
        RuleFor(x => x.Observacion).MaximumLength(500).When(x => x.Observacion is not null);
    }
}
