namespace EduConnect.Api.DTOs.Aluno;

public class AlunoResponseDto
{
    public int AlunoId { get; set; }
    public int UsuarioAlunoId { get; set; }
    public string RegistroAluno { get; set; } = string.Empty;
    public string NomeCompletoAluno { get; set; } = string.Empty;
    public DateTime DataNascimentoAluno { get; set; }
    public string? FotoUrl { get; set; }
    public decimal ValorMensalPadrao { get; set; }
    public string EmailAluno { get; set; } = string.Empty;

    public int ResponsavelId { get; set; }
    public int UsuarioResponsavelId { get; set; }
    public string RegistroResponsavel { get; set; } = string.Empty;
    public string NomeCompletoResponsavel { get; set; } = string.Empty;
    public string TelefoneResponsavel { get; set; } = string.Empty;
    public string EmailContatoResponsavel { get; set; } = string.Empty;

    public string? TipoResponsabilidade { get; set; }
    public bool ResponsavelPrincipal { get; set; }
    public bool ResponsavelJaExistia { get; set; }
}