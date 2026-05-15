using FluentValidation;
using OPT.Application.Anamnesis.Commands;

namespace OPT.Application.Anamnesis.Validators;

public class CreateAnamnesisCommandValidator : AbstractValidator<CreateAnamnesisCommand>
{
    public CreateAnamnesisCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId inválido.");

        RuleFor(x => x.ClienteId)
            .NotEmpty().WithMessage("ClienteId inválido.");

        RuleFor(x => x.Observacion)
            .MaximumLength(1000).WithMessage("La observación no puede superar los 1000 caracteres.")
            .When(x => x.Observacion is not null);

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("CreatedBy es requerido.");
    }
}
