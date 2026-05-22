using FluentValidation;
using OPT.Application.Productos.Commands;

namespace OPT.Application.Productos.Validators;

public class CreateProductoCategoriaCommandValidator : AbstractValidator<CreateProductoCategoriaCommand>
{
    public CreateProductoCategoriaCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId inválido.");
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(100).WithMessage("El nombre es requerido y no puede superar 100 caracteres.");
        RuleFor(x => x.CreatedBy).NotEmpty().WithMessage("CreatedBy es requerido.");
    }
}
