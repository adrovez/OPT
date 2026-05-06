using FluentValidation;
using OPT.Application.Clientes.Commands;

namespace OPT.Application.Clientes.Validators;

public class CreateClienteCommandValidator : AbstractValidator<CreateClienteCommand>
{
    private static readonly string[] TiposValidos = ["Persona", "Empresa"];

    public CreateClienteCommandValidator()
    {
        RuleFor(x => x.TipoCliente)
            .NotEmpty()
            .Must(t => TiposValidos.Contains(t))
            .WithMessage("TipoCliente debe ser 'Persona' o 'Empresa'.");

        RuleFor(x => x.NumeroDocumento)
            .NotEmpty().WithMessage("El RUT/documento es requerido.")
            .MaximumLength(20);

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .MaximumLength(200);

        RuleFor(x => x.Mail)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Mail))
            .WithMessage("El email no tiene formato válido.");
    }
}
