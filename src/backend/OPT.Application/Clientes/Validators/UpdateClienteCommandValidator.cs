using FluentValidation;
using OPT.Application.Clientes.Commands;

namespace OPT.Application.Clientes.Validators;

public class UpdateClienteCommandValidator : AbstractValidator<UpdateClienteCommand>
{
    public UpdateClienteCommandValidator()
    {
        RuleFor(x => x.ClienteId).NotEmpty();
        RuleFor(x => x.TenantId).NotEmpty();

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .MaximumLength(200);

        RuleFor(x => x.Mail)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Mail))
            .WithMessage("El email no tiene formato válido.");
    }
}
