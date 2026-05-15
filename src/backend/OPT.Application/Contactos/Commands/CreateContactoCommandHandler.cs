using MediatR;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Application.Contactos.Commands;

public class CreateContactoCommandHandler(
    IContactoRepository contactoRepository,
    IClienteRepository clienteRepository)
    : IRequestHandler<CreateContactoCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateContactoCommand request, CancellationToken cancellationToken)
    {
        // Validar que el cliente exista y pertenezca al tenant
        var cliente = await clienteRepository.GetByIdAsync(
            request.ClienteId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException(
                $"Cliente {request.ClienteId} no encontrado en este tenant.");

        // Solo clientes Empresa pueden tener contactos
        if (!string.Equals(cliente.TipoCliente, "Empresa", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException(
                "Solo se pueden agregar contactos a clientes de tipo Empresa.");

        var contacto = new Contacto
        {
            TenantId = request.TenantId,
            ClienteId = request.ClienteId,
            Nombre = request.Nombre,
            Email = request.Email,
            Telefono = request.Telefono,
            Cargo = request.Cargo,
            Activo = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.CreatedBy
        };

        var creado = await contactoRepository.AddAsync(contacto, cancellationToken);
        return creado.ContactoId;
    }
}
