using FluentValidation;
using OPT.Application.Productos.Commands;

namespace OPT.Application.Productos.Validators;

public class CreateProductoCommandValidator : AbstractValidator<CreateProductoCommand>
{
    private static readonly string[] TiposValidos = ["Almacenable", "Consumible", "Servicio"];

    public CreateProductoCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId inválido.");
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200).WithMessage("El nombre es requerido y no puede superar 200 caracteres.");
        RuleFor(x => x.TipoProducto).Must(t => TiposValidos.Contains(t)).WithMessage("TipoProducto debe ser Almacenable, Consumible o Servicio.");
        RuleFor(x => x.CodigoInterno).MaximumLength(50).When(x => x.CodigoInterno is not null);
        RuleFor(x => x.Descripcion).MaximumLength(1000).When(x => x.Descripcion is not null);
        RuleFor(x => x.CreatedBy).NotEmpty().WithMessage("CreatedBy es requerido.");
    }
}
