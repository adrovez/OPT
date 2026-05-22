using FluentValidation;
using OPT.Application.Productos.Commands;

namespace OPT.Application.Productos.Validators;

public class UpdateProductoVarianteCommandValidator : AbstractValidator<UpdateProductoVarianteCommand>
{
    public UpdateProductoVarianteCommandValidator()
    {
        RuleFor(x => x.VarianteId).NotEmpty().WithMessage("VarianteId inválido.");
        RuleFor(x => x.ProductoId).NotEmpty().WithMessage("ProductoId inválido.");
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId inválido.");
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200).WithMessage("El nombre de la variante es requerido y no puede superar 200 caracteres.");
        RuleFor(x => x.CodigoBarras).MaximumLength(50).When(x => x.CodigoBarras is not null);
        RuleFor(x => x.UpdatedBy).NotEmpty().WithMessage("UpdatedBy es requerido.");
    }
}
