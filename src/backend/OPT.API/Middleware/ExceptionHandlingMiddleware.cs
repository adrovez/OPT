using System.Net;
using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace OPT.API.Middleware;

/// <summary>
/// Middleware global de manejo de excepciones.
/// Convierte todas las excepciones no capturadas en respuestas JSON estándar (RFC 7807 ProblemDetails)
/// evitando que stack traces o datos internos lleguen al cliente.
/// </summary>
/// <remarks>
/// Mapa de excepciones:
/// - ValidationException (FluentValidation) → 400 Bad Request
/// - UnauthorizedAccessException           → 401 Unauthorized
/// - KeyNotFoundException                  → 404 Not Found
/// - InvalidOperationException             → 409 Conflict  (reglas de negocio)
/// - Exception (resto)                     → 500 Internal Server Error
/// </remarks>
public class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, detail) = exception switch
        {
            ValidationException ve => (
                HttpStatusCode.BadRequest,
                "Error de validación",
                string.Join("; ", ve.Errors.Select(e => e.ErrorMessage))),

            UnauthorizedAccessException ue => (
                HttpStatusCode.Unauthorized,
                "No autorizado",
                ue.Message),

            KeyNotFoundException ke => (
                HttpStatusCode.NotFound,
                "Recurso no encontrado",
                ke.Message),

            InvalidOperationException ie => (
                HttpStatusCode.Conflict,
                "Operación inválida",
                ie.Message),

            _ => (
                HttpStatusCode.InternalServerError,
                "Error interno del servidor",
                "Ocurrió un error inesperado. Por favor intente nuevamente.")
        };

        // Log con nivel adecuado; errores 5xx van como Error, el resto como Warning.
        // IMPORTANTE: nunca se loguea el mensaje completo en 500 hacia el cliente.
        if (statusCode == HttpStatusCode.InternalServerError)
            logger.LogError(exception, "Error no controlado en {Method} {Path}",
                context.Request.Method, context.Request.Path);
        else
            logger.LogWarning(exception, "{StatusCode} en {Method} {Path}: {Detail}",
                (int)statusCode, context.Request.Method, context.Request.Path, detail);

        var problem = new ProblemDetails
        {
            Status = (int)statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        // Agrega los errores de validación como extensión si es ValidationException
        if (exception is ValidationException validationEx)
        {
            problem.Extensions["errors"] = validationEx.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray());
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)statusCode;

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(problem, JsonOptions));
    }
}

/// <summary>Extensión para registrar ExceptionHandlingMiddleware en el pipeline.</summary>
public static class ExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder app)
        => app.UseMiddleware<ExceptionHandlingMiddleware>();
}
