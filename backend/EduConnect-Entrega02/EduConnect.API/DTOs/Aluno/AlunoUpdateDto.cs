namespace EduConnect.Api.DTOs.Aluno;

public class AlunoUpdateDto
{
    public string NomeCompletoAluno { get; set; } = string.Empty;
    public DateTime DataNascimentoAluno { get; set; }
    public string? FotoUrl { get; set; }
    public decimal ValorMensalPadrao { get; set; }
    public bool Ativo { get; set; } = true;

    public string NomeCompletoResponsavel { get; set; } = string.Empty;
    public string TelefoneResponsavel { get; set; } = string.Empty;
    public string EmailContatoResponsavel { get; set; } = string.Empty;

    public string? TipoResponsabilidade { get; set; }
    public bool ResponsavelPrincipal { get; set; } = true;
}