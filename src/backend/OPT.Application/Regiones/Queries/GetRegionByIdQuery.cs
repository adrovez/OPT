using MediatR;
using OPT.Application.Regiones.DTOs;

namespace OPT.Application.Regiones.Queries;

/// <summary>Query para obtener el detalle de una región por su ID.</summary>
public record GetRegionByIdQuery(int IdRegion) : IRequest<RegionDto?>;
