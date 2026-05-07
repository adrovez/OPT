using MediatR;
using OPT.Application.Regiones.DTOs;

namespace OPT.Application.Regiones.Queries;

/// <summary>Query para obtener todas las regiones activas con sus comunas anidadas.</summary>
public record GetRegionesWithComunasQuery : IRequest<IReadOnlyList<RegionWithComunasDto>>;
