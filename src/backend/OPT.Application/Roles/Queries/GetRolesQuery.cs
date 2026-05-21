using MediatR;
using OPT.Application.Roles.DTOs;

namespace OPT.Application.Roles.Queries;

/// <summary>Query para obtener todos los roles del catálogo.</summary>
public record GetRolesQuery : IRequest<IReadOnlyList<RolDto>>;
