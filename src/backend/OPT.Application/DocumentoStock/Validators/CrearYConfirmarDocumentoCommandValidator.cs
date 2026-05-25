using FluentValidation;
using OPT.Application.DocumentoStock.Commands;

namespace OPT.Application.DocumentoStock.Validators;

public class CrearYConfirmarDocumentoCommandValidator : AbstractValidator<CrearYConfirmarDocumentoCommand>
{
    private static readonly string[] TiposValidos = ["FacturaCompra", "BoletaCompra", "OtroIngreso"];

    public CrearYConfirmarDocumentoCommandValidator()
    {
        RuleFor(x => x.TipoDocumento)
            .NotEmpty()
            .Must(t => TiposValidos.Contains(t))
            .WithMessage("Tipo de documento inválido. Use: FacturaCompra, BoletaCompra u OtroIngreso.");

        RuleFor(x => x.NumeroDocumento)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.Fecha)
            .NotEmpty();

        RuleFor(x => x.ProveedorNombre)
            .MaximumLength(200)
            .When(x => x.ProveedorNombre is not null);

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .When(x => x.Observacion is not null);

        RuleFor(x => x.Lineas)
            .NotEmpty()
            .WithMessage("El documento debe tener al menos una línea.")
            .Must(ls => ls.Select(l => l.VarianteId).Distinct().Count() == ls.Count)
            .WithMessage("No se puede incluir la misma variante más de una vez en el documento.");

        RuleForEach(x => x.Lineas).ChildRules(linea =>
        {
            linea.RuleFor(l => l.VarianteId).NotEmpty();
            linea.RuleFor(l => l.Cantidad).GreaterThan(0);
            linea.RuleFor(l => l.PrecioCosto)
                .GreaterThanOrEqualTo(0)
                .When(l => l.PrecioCosto.HasValue);
        });
    }
}
