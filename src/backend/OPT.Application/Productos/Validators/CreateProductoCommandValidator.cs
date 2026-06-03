using FluentValidation;
using OPT.Application.Productos.Commands;

namespace OPT.Application.Productos.Validators;

public class CreateProductoCommandValidator : AbstractValidator<CreateProductoCommand>
{
    private static readonly string[] TiposValidos = ["Producto", "Servicio"];

    public CreateProductoCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.CodigoInterno).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Tipo).Must(t => TiposValidos.Contains(t))
            .WithMessage("Tipo debe ser 'Producto' o 'Servicio'.");
        RuleFor(x => x.Descripcion).MaximumLength(2000).When(x => x.Descripcion is not null);
        RuleFor(x => x.UnidadMedida).MaximumLength(50).When(x => x.UnidadMedida is not null);
        RuleFor(x => x.CreatedBy).NotEmpty();
    }
}
