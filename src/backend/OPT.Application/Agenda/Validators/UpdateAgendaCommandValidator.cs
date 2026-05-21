using FluentValidation;
using OPT.Application.Agenda.Commands;

namespace OPT.Application.Agenda.Validators;

public class UpdateAgendaCommandValidator : AbstractValidator<UpdateAgendaCommand>
{
    public UpdateAgendaCommandValidator()
    {
        RuleFor(x => x.AgendaId).NotEmpty();
        RuleFor(x => x.FechaHora).NotEmpty();
        RuleFor(x => x.Motivo).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DuracionMinutos).GreaterThan((short)0);
        RuleFor(x => x.Observaciones).MaximumLength(500).When(x => x.Observaciones is not null);
    }
}
