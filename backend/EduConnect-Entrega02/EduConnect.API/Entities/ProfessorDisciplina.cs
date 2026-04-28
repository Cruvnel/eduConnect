namespace EduConnect.Api.Entities;

public class ProfessorDisciplina
{
    public int ProfessorDisciplinaId { get; set; }
    public int ProfessorId { get; set; }
    public int DisciplinaId { get; set; }
    public int NivelEnsinoId { get; set; }
    public int CargaHorariaSemanal { get; set; }

    public Professor Professor { get; set; } = null!;
    public Disciplina Disciplina { get; set; } = null!;
    public NivelEnsino NivelEnsino { get; set; } = null!;
}