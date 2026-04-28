namespace EduConnect.Api.DTOs.Ocorrencia;

public class OcorrenciaAlunoResponseDto
{
    public int OcorrenciaId { get; set; }

    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;

    public int ProfessorId { get; set; }
    public string ProfessorNome { get; set; } = string.Empty;
    public string DisciplinaNome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public DateTime DataOcorrencia { get; set; }
}