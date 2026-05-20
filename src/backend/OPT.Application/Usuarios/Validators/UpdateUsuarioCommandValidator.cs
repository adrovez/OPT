using FluentValidation;
using OPT.Application.Usuarios.Commands;

namespace OPT.Application.Usuarios.Validators;

public class UpdateUsuarioCommandValidator : AbstractValidator<UpdateUsuarioCommand>
{
    private static readonly string[] RolesValidos = ["Admin", "Operador", "Lectura"];

    public UpdateUsuarioCommandValidator()
    {
        RuleFor(x => x.UsuarioId).NotEmpty();
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Email).NotEmpty().MaximumLength(150).EmailAddress();
        RuleFor(x => x.Rol).NotEmpty().Must(r => RolesValidos.Contains(r))
            .WithMessage("Rol debe ser Admin, Operador o Lectura.");
        RuleFor(x => x.UpdatedBy).NotEmpty().MaximumLength(100);
    }
}
