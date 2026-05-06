using MediatR;
using OPT.Application.Clientes.DTOs;

namespace OPT.Application.Clientes.Queries;

/// <summary>Query para obtener el detalle de un cliente por ID (validando TenantId).</summary>
public record GetClienteByIdQuery(int ClienteId, int TenantId) : IRequest<ClienteDto?>;
