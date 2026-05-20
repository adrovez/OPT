using FluentValidation;
using OPT.Application.Usuarios.Commands;

namespace OPT.Application.Usuarios.Validators;

public class CreateUsuarioCommandValidator : AbstractValidator<CreateUsuarioCommand>
{
    private static readonly string[] RolesValidos = ["Admin", "Operador", "Lectura"];

    public CreateUsuarioCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.RutUsuario).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Email).NotEmpty().MaximumLength(150).EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(100);
        RuleFor(x => x.Rol).NotEmpty().Must(r => RolesValidos.Contains(r))
            .WithMessage("Rol debe ser Admin, Operador o Lectura.");
        RuleFor(x => x.CreatedBy).NotEmpty().MaximumLength(100);
    }
}
