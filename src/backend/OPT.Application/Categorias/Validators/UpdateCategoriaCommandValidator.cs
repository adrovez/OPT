using FluentValidation;
using OPT.Application.Categorias.Commands;

namespace OPT.Application.Categorias.Validators;

public class UpdateCategoriaCommandValidator : AbstractValidator<UpdateCategoriaCommand>
{
    public UpdateCategoriaCommandValidator()
    {
        RuleFor(x => x.CategoriaId).NotEmpty();
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Descripcion).MaximumLength(500).When(x => x.Descripcion is not null);
        RuleFor(x => x.UpdatedBy).NotEmpty();
    }
}
