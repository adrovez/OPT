using FluentValidation;
using OPT.Application.Contactos.Commands;

namespace OPT.Application.Contactos.Validators;

public class CreateContactoCommandValidator : AbstractValidator<CreateContactoCommand>
{
    public CreateContactoCommandValidator()
    {
        RuleFor(x => x.ClienteId)
            .GreaterThan(0).WithMessage("ClienteId inválido.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre del contacto es requerido.")
            .MaximumLength(150);

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("El email no tiene formato válido.")
            .MaximumLength(150);

        RuleFor(x => x.Telefono)
            .MaximumLength(50);

        RuleFor(x => x.Cargo)
            .MaximumLength(100);
    }
}
