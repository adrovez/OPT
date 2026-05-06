namespace OPT.Application.Interfaces;

/// <summary>
/// Abstracción para hash y verificación de contraseñas.
/// Implementado en Infrastructure con BCrypt; la capa Application no depende de la librería concreta.
/// </summary>
public interface IPasswordHasher
{
    /// <summary>Verifica si la contraseña en texto plano coincide con el hash almacenado.</summary>
    bool Verify(string password, string hash);

    /// <summary>Genera el hash de una contraseña en texto plano.</summary>
    string Hash(string password);
}
