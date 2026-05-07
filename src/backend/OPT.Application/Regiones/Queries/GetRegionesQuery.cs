using MediatR;
using OPT.Application.Regiones.DTOs;

namespace OPT.Application.Regiones.Queries;

/// <summary>Query para obtener todas las regiones activas del catálogo.</summary>
public record GetRegionesQuery : IRequest<IReadOnlyList<RegionDto>>;
