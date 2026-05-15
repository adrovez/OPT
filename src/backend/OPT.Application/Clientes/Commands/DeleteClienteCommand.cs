using MediatR;

namespace OPT.Application.Clientes.Commands;

/// <summary>Elimina lógicamente un cliente (IsDeleted = true).</summary>
public record DeleteClienteCommand(Guid ClienteId, Guid TenantId, string DeletedBy) : IRequest;
