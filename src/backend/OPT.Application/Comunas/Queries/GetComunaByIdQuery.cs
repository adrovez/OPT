using MediatR;
using OPT.Application.Comunas.DTOs;

namespace OPT.Application.Comunas.Queries;

/// <summary>Query para obtener el detalle de una comuna por su ID.</summary>
public record GetComunaByIdQuery(int IdComuna) : IRequest<ComunaDto?>;
