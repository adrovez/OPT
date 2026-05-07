using MediatR;
using OPT.Application.Comunas.DTOs;

namespace OPT.Application.Comunas.Queries;

/// <summary>Query para obtener todas las comunas de una región específica.</summary>
public record GetComunasByRegionQuery(int IdRegion) : IRequest<IReadOnlyList<ComunaDto>>;
