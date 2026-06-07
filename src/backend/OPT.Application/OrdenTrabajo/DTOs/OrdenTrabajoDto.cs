namespace OPT.Application.OrdenTrabajo.DTOs;

public record OrdenTrabajoDto(
    Guid OTId,
    string NumeroOT,
    Guid ClienteId,
    string ClienteNombre,
    string ClienteRut,
    string TipoFacturacion,
    Guid? EmpresaClienteId,
    string? EmpresaNombre,
    string? Beneficiario,
    DateOnly FechaIngreso,
    DateOnly FechaEntrega,
    decimal SubTotal,
    decimal Descuento,
    decimal MontoTotal,
    decimal TotalAbonado,
    decimal Saldo,
    string EstadoPago,
    string EtapaOT
);

public record OrdenTrabajoDetalleDto(
    Guid OTId,
    string NumeroOT,
    Guid ClienteId,
    string ClienteNombre,
    string ClienteRut,
    string TipoFacturacion,
    Guid? EmpresaClienteId,
    string? EmpresaNombre,
    string? Beneficiario,
    Guid? AtencionId,
    Guid? RecetaCristalesId,
    DateOnly FechaIngreso,
    DateOnly FechaEntrega,
    TimeOnly? HoraEntrega,
    decimal SubTotal,
    decimal Descuento,
    decimal MontoTotal,
    decimal TotalAbonado,
    decimal Saldo,
    int NumeroCuotas,
    DateOnly? FechaInicioCuotas,
    string EstadoPago,
    string EtapaOT,
    string? Observacion,
    DateTime CreatedAt,
    string CreatedBy,
    IReadOnlyList<OrdenTrabajoLineaDto> Lineas,
    IReadOnlyList<OrdenTrabajoPagoDto> Pagos,
    IReadOnlyList<OrdenTrabajoCuotaDto> Cuotas,
    IReadOnlyList<OrdenTrabajoBitacoraDto> Bitacora
);

public record OrdenTrabajoLineaDto(
    Guid LineaId,
    Guid ProductoId,
    string ProductoNombre,
    string CodigoInterno,
    int Cantidad,
    decimal ValorUnitario,
    decimal SubtotalLinea,
    string? Comentario
);

public record OrdenTrabajoPagoDto(
    Guid PagoId,
    int FormaPagoId,
    string FormaPagoDescripcion,
    decimal Monto,
    DateOnly FechaPago,
    bool EsAbono,
    string? Observacion,
    DateTime CreatedAt,
    string CreatedBy
);

public record OrdenTrabajoCuotaDto(
    Guid CuotaId,
    int Numero,
    decimal ValorCuota,
    DateOnly FechaVencimiento,
    DateOnly? FechaPago,
    string Estado
);

public record OrdenTrabajoBitacoraDto(
    Guid BitacoraId,
    string Etapa,
    DateTime Fecha,
    string Responsable,
    string? Observacion
);
