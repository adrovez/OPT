using FluentValidation;
using OPT.Application.Agenda.Commands;

namespace OPT.Application.Agenda.Validators;

public class CreateAgendaCommandValidator : AbstractValidator<CreateAgendaCommand>
{
    public CreateAgendaCommandValidator()
    {
        RuleFor(x => x.SucursalId).NotEmpty();
        RuleFor(x => x.ClienteId).NotEmpty();
        RuleFor(x => x.FechaHora).NotEmpty();
        RuleFor(x => x.Motivo).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DuracionMinutos).GreaterThan((short)0);
        RuleFor(x => x.Observaciones).MaximumLength(500).When(x => x.Observaciones is not null);
    }
}
