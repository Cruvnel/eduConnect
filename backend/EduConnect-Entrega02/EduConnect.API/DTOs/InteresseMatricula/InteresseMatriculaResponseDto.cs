namespace EduConnect.Api.DTOs.InteresseMatricula;

public class InteresseMatriculaResponseDto
{
    public int InteresseMatriculaId { get; set; }

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
    public string Status { get; set; } = string.Empty;
    public DateTime DataSolicitacao { get; set; }
}