using FluentValidation;
using OPT.Application.Sucursales.Commands;

namespace OPT.Application.Sucursales.Validators;

public class CreateSucursalCommandValidator : AbstractValidator<CreateSucursalCommand>
{
    public CreateSucursalCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Direccion).MaximumLength(250).When(x => x.Direccion is not null);
        RuleFor(x => x.Telefono).MaximumLength(50).When(x => x.Telefono is not null);
        RuleFor(x => x.CreatedBy).NotEmpty().MaximumLength(100);
    }
}
