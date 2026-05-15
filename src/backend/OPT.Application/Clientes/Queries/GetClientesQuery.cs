using MediatR;
using OPT.Application.Common;
using OPT.Application.Clientes.DTOs;

namespace OPT.Application.Clientes.Queries;

/// <summary>Query para listar clientes con filtros y paginación.</summary>
public record GetClientesQuery(
    Guid TenantId,
    string? TipoCliente = null,
    string? Busqueda = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ClienteDto>>;
