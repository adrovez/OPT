using FluentValidation;
using OPT.Application.Categorias.Commands;

namespace OPT.Application.Categorias.Validators;

public class CreateCategoriaCommandValidator : AbstractValidator<CreateCategoriaCommand>
{
    public CreateCategoriaCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Descripcion).MaximumLength(500).When(x => x.Descripcion is not null);
        RuleFor(x => x.CreatedBy).NotEmpty();
    }
}
