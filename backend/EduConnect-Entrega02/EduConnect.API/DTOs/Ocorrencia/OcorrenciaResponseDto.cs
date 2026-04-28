namespace EduConnect.Api.DTOs.Ocorrencia;

public class OcorrenciaResponseDto
{
    public int OcorrenciaId { get; set; }

    public int ProfessorId { get; set; }
    public string ProfessorNome { get; set; } = string.Empty;

    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;

    public int AlunoId { get; set; }
    public string AlunoNome { get; set; } = string.Empty;

    public string DisciplinaNome { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;
    public DateTime DataOcorrencia { get; set; }
}