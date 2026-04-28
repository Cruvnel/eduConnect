namespace EduConnect.Api.DTOs.Aluno;

public class AlunoListItemDto
{
    public int AlunoId { get; set; }
    public int UsuarioAlunoId { get; set; }
    public string RegistroAluno { get; set; } = string.Empty;
    public string NomeCompletoAluno { get; set; } = string.Empty;
    public string EmailAluno { get; set; } = string.Empty;
    public bool Ativo { get; set; }

    public int? TurmaId { get; set; }
    public string? TurmaNome { get; set; }

    public int? ResponsavelId { get; set; }
    public string? NomeCompletoResponsavel { get; set; }
    public string? EmailContatoResponsavel { get; set; }
}