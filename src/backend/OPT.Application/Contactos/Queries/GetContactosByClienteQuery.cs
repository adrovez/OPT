using MediatR;
using OPT.Application.Contactos.DTOs;

namespace OPT.Application.Contactos.Queries;

/// <summary>Query para listar los contactos de un cliente del tenant autenticado.</summary>
public record GetContactosByClienteQuery(
    Guid ClienteId,
    Guid TenantId) : IRequest<IReadOnlyList<ContactoDto>>;
