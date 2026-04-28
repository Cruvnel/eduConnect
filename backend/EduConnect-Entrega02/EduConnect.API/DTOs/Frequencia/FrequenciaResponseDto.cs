namespace EduConnect.Api.DTOs.Frequencia;

public class FrequenciaResponseDto
{
    public int FrequenciaId { get; set; }
    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;

    public int AlunoId { get; set; }
    public string AlunoNome { get; set; } = string.Empty;

    public int DisciplinaId { get; set; }
    public string DisciplinaNome { get; set; } = string.Empty;

    public int RegistradoPorProfessorId { get; set; }
    public DateTime DataAula { get; set; }
    public bool Presente { get; set; }
    public string? Observacao { get; set; }
    public DateTime DataRegistro { get; set; }
}