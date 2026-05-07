using MediatR;
using OPT.Application.Interfaces;
using OPT.Domain.Entities;

namespace OPT.Application.Clientes.Commands;

public class UpdateClienteCommandHandler(
    IClienteRepository clienteRepository,
    IContactoRepository contactoRepository)
    : IRequestHandler<UpdateClienteCommand>
{
    public async Task Handle(UpdateClienteCommand request, CancellationToken cancellationToken)
    {
        var cliente = await clienteRepository.GetByIdAsync(
            request.ClienteId, request.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException(
                $"Cliente {request.ClienteId} no encontrado en este tenant.");

        // Solo se actualizan campos editables; TipoCliente y NumeroDocumento son inmutables
        cliente.Nombre = request.Nombre;
        cliente.Direccion = request.Direccion;
        cliente.IdComuna = request.IdComuna;
        cliente.Celular = request.Celular;
        cliente.Mail = request.Mail;
        cliente.FechaNacimiento = request.FechaNacimiento;
        cliente.TipoPrevision = request.TipoPrevision;
        cliente.Giro = request.Giro;
        cliente.UpdatedBy = request.UpdatedBy;
        cliente.UpdatedAt = DateTime.UtcNow;

        await clienteRepository.UpdateAsync(cliente, cancellationToken);

        // Sincronizar contactos: reemplazar lista completa (soft-delete + re-crear)
        await contactoRepository.SoftDeleteByClienteAsync(
            request.ClienteId, request.TenantId, request.UpdatedBy, cancellationToken);

        if (request.Contactos is { Count: > 0 })
        {
            var nuevosContactos = request.Contactos.Select(c => new Contacto
            {
                TenantId = request.TenantId,
                ClienteId = request.ClienteId,
                Nombre = c.Nombre,
                Cargo = c.Cargo,
                Email = c.Email,
                Telefono = c.Telefono,
                Activo = true,
                CreatedBy = request.UpdatedBy,
                CreatedAt = DateTime.UtcNow
            });

            await contactoRepository.AddRangeAsync(nuevosContactos, cancellationToken);
        }
    }
}
