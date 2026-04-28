namespace EduConnect.Api.DTOs.InteresseMatricula;

public class InteresseMatriculaCreateDto
{
    public string NomeResponsavel { get; set; } = string.Empty;
    public DateTime DataNascimentoResponsavel { get; set; }
    public string EmailContato { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string? DocumentoResponsavelUrl { get; set; }

    public string NomeAluno { get; set; } = string.Empty;
    public DateTime DataNascimentoAluno { get; set; }
    public string AnoEscolarAtual { get; set; } = string.Empty;
    public string? DocumentoAlunoUrl { get; set; }

    public string? Observacoes { get; set; }
}