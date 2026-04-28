namespace EduConnect.Api.DTOs.Frequencia;

public class FrequenciaAlunoResponseDto
{
    public int FrequenciaId { get; set; }

    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;

    public int DisciplinaId { get; set; }
    public string DisciplinaNome { get; set; } = string.Empty;

    public DateTime DataAula { get; set; }
    public bool Presente { get; set; }
    public string? Observacao { get; set; }

    public string ProfessorNome { get; set; } = string.Empty;
}