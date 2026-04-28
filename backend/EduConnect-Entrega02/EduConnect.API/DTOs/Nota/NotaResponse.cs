namespace EduConnect.Api.DTOs.Nota;

public class NotaResponseDto
{
    public int NotaId { get; set; }
    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;

    public int AlunoId { get; set; }
    public string AlunoNome { get; set; } = string.Empty;

    public int DisciplinaId { get; set; }
    public string DisciplinaNome { get; set; } = string.Empty;

    public string TipoAvaliacao { get; set; } = string.Empty;
    public decimal Valor { get; set; }

    public int LancadoPorProfessorId { get; set; }
    public DateTime DataLancamento { get; set; }
}