using MediatR;
using OPT.Application.Interfaces;

namespace OPT.Application.DocumentoEntrada.Commands;

public record CrearDocumentoEntradaCommand(
    Guid TenantId,
    Guid SucursalId,
    string TipoDocumento,
    string? NumeroDocumento,
    DateOnly FechaDocumento,
    string? ProveedorNombre,
    string? ProveedorRut,
    string? Observaciones,
    IReadOnlyList<DocumentoEntradaLineaInput> Lineas,
    string CreatedBy) : IRequest<Guid>;
