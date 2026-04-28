namespace EduConnect.Api.Entities;

public class TurmaProfessorDisciplina
{
    public int TurmaProfessorDisciplinaId { get; set; }
    public int TurmaId { get; set; }
    public int ProfessorId { get; set; }
    public int DisciplinaId { get; set; }
    public int VinculadoPorUsuarioId { get; set; }
    public DateTime DataVinculo { get; set; } = DateTime.UtcNow;

    public Turma Turma { get; set; } = null!;
    public Professor Professor { get; set; } = null!;
    public Disciplina Disciplina { get; set; } = null!;
    public Usuario VinculadoPorUsuario { get; set; } = null!;
}