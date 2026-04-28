namespace EduConnect.Api.Entities;

public class Ocorrencia
{
    public int OcorrenciaId { get; set; }
    public int ProfessorId { get; set; }
    public int TurmaId { get; set; }
    public int AlunoId { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public DateTime DataOcorrencia { get; set; } = DateTime.UtcNow;

    public Professor Professor { get; set; } = null!;
    public Turma Turma { get; set; } = null!;
    public Aluno Aluno { get; set; } = null!;
}