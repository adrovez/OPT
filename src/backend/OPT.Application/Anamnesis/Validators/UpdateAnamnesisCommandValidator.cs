using FluentValidation;
using OPT.Application.Anamnesis.Commands;

namespace OPT.Application.Anamnesis.Validators;

public class UpdateAnamnesisCommandValidator : AbstractValidator<UpdateAnamnesisCommand>
{
    public UpdateAnamnesisCommandValidator()
    {
        RuleFor(x => x.AnamnesisId)
            .NotEmpty().WithMessage("AnamnesisId inválido.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId inválido.");

        RuleFor(x => x.Observacion)
            .MaximumLength(1000).WithMessage("La observación no puede superar los 1000 caracteres.")
            .When(x => x.Observacion is not null);

        RuleFor(x => x.UpdatedBy)
            .NotEmpty().WithMessage("UpdatedBy es requerido.");
    }
}
