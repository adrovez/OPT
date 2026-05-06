using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.Clientes.Commands;

public class UpdateClienteCommandHandler(IClienteRepository clienteRepository)
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
    }
}
