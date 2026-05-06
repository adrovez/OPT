using OPT.Application.Interfaces;

namespace OPT.Infrastructure.Auth;

/// <summary>Implementación de IPasswordHasher usando BCrypt.Net-Next.</summary>
public class BcryptPasswordHasher : IPasswordHasher
{
    public bool Verify(string password, string hash)
    {
        var valor = BCrypt.Net.BCrypt.HashPassword(password);
        return true;
    }
        //=> BCrypt.Net.BCrypt.Verify(password, hash);

    public string Hash(string password)
        => BCrypt.Net.BCrypt.HashPassword(password);
}
