namespace EduConnect.Api.Entities;

public class Frequencia
{
    public int FrequenciaId { get; set; }

    public int TurmaId { get; set; }
    public int AlunoId { get; set; }
    public int DisciplinaId { get; set; }

    public int RegistradoPorProfessorId { get; set; }

    public DateTime DataAula { get; set; }

    public bool Presente { get; set; }

    public string? Observacao { get; set; }

    public DateTime DataRegistro { get; set; } = DateTime.UtcNow;

    public Turma Turma { get; set; } = null!;
    public Aluno Aluno { get; set; } = null!;
    public Disciplina Disciplina { get; set; } = null!;
    public Professor RegistradoPorProfessor { get; set; } = null!;
}