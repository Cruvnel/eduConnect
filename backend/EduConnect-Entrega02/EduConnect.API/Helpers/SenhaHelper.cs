using System.Security.Cryptography;
using System.Text;

namespace EduConnect.Api.Helpers;

public static class SenhaHelper
{
    private const string Caracteres = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789@#";

    public static string GerarSenhaAleatoria(int tamanho = 10)
    {
        var bytes = new byte[tamanho];
        RandomNumberGenerator.Fill(bytes);

        var sb = new StringBuilder(tamanho);

        foreach (var b in bytes)
        {
            sb.Append(Caracteres[b % Caracteres.Length]);
        }

        return sb.ToString();
    }
}