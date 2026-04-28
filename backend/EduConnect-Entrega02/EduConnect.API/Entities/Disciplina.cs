namespace EduConnect.Api.Entities;

public class Disciplina
{
    public int DisciplinaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public int NivelEnsinoId { get; set; }

    public NivelEnsino NivelEnsino { get; set; } = null!;
    public ICollection<ProfessorDisciplina> ProfessorDisciplinas { get; set; } = new List<ProfessorDisciplina>();
    public ICollection<TurmaProfessorDisciplina> TurmaProfessorDisciplinas { get; set; } = new List<TurmaProfessorDisciplina>();
}