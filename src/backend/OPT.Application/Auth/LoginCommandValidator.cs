using FluentValidation;

namespace OPT.Application.Auth;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .GreaterThan(0).WithMessage("TenantId inválido.");

        RuleFor(x => x.Rut)
            .NotEmpty().WithMessage("El RUT es requerido.")
            .MaximumLength(20);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es requerida.")
            .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres.");
    }
}
