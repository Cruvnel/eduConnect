namespace EduConnect.Api.DTOs.Nota;

public class RegistrarNotasDto
{
    public int TurmaId { get; set; }
    public string TipoAvaliacao { get; set; } = string.Empty;
    public List<NotaAlunoDto> Alunos { get; set; } = new();
    public string? MotivoAlteracao { get; set; }
}