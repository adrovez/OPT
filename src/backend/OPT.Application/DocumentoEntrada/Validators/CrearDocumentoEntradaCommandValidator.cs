using FluentValidation;
using OPT.Application.DocumentoEntrada.Commands;

namespace OPT.Application.DocumentoEntrada.Validators;

public class CrearDocumentoEntradaCommandValidator : AbstractValidator<CrearDocumentoEntradaCommand>
{
    private static readonly string[] TiposValidos =
        ["FacturaCompra", "BoletaCompra", "GuiaDespacho", "OtroIngreso"];

    public CrearDocumentoEntradaCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.SucursalId).NotEmpty();
        RuleFor(x => x.TipoDocumento)
            .NotEmpty()
            .Must(t => TiposValidos.Contains(t))
            .WithMessage("TipoDocumento debe ser 'FacturaCompra', 'BoletaCompra', 'GuiaDespacho' o 'OtroIngreso'.");
        RuleFor(x => x.NumeroDocumento).MaximumLength(50).When(x => x.NumeroDocumento is not null);
        RuleFor(x => x.ProveedorNombre).MaximumLength(200).When(x => x.ProveedorNombre is not null);
        RuleFor(x => x.ProveedorRut).MaximumLength(20).When(x => x.ProveedorRut is not null);
        RuleFor(x => x.Observaciones).MaximumLength(2000).When(x => x.Observaciones is not null);
        RuleFor(x => x.Lineas).NotEmpty().WithMessage("El documento debe tener al menos una línea.");
        RuleForEach(x => x.Lineas).ChildRules(l =>
        {
            l.RuleFor(x => x.ProductoId).NotEmpty();
            l.RuleFor(x => x.Cantidad).GreaterThan(0);
        });
        RuleFor(x => x.CreatedBy).NotEmpty();
    }
}
