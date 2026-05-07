namespace OPT.Application.Clientes.DTOs;

/// <summary>
/// DTO de entrada para un contacto al crear o actualizar un Cliente Empresa.
/// No lleva ContactoId: en cada actualización se reemplaza la lista completa.
/// </summary>
public record ContactoInputDto(
    string Nombre,
    string? Cargo,
    string? Email,
    string? Telefono);
