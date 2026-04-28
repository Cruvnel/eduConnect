namespace EduConnect.Api.DTOs.Nota;

public class NotaTurmaResumoDto
{
    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;

    public int DisciplinaId { get; set; }
    public string DisciplinaNome { get; set; } = string.Empty;

    public List<NotaResponseDto> Notas { get; set; } = new();
}