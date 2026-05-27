using MediatR;
using OPT.Application.FormaPago.DTOs;

namespace OPT.Application.FormaPago.Queries;

public record GetFormaPagosQuery : IRequest<IReadOnlyList<FormaPagoDto>>;
