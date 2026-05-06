using MediatR;

namespace OPT.Application.Clientes.Commands;

/// <summary>Elimina lógicamente un cliente (IsDeleted = true).</summary>
public record DeleteClienteCommand(int ClienteId, int TenantId, string DeletedBy) : IRequest;
