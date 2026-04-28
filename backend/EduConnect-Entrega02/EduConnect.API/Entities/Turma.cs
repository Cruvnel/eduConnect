namespace EduConnect.Api.Entities;

public class Turma
{
    public int TurmaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int NivelEnsinoId { get; set; }
    public int AnoLetivo { get; set; }
    public string? Sala { get; set; }
    public string? ProfessorTutorNome { get; set; }
    public string? Descricao { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public DateTime DataValidade { get; set; }
    public bool Ativa { get; set; } = true;

    public NivelEnsino NivelEnsino { get; set; } = null!;
    public ICollection<TurmaAluno> TurmasAluno { get; set; } = new List<TurmaAluno>();
    public ICollection<TurmaProfessorDisciplina> TurmaProfessorDisciplinas { get; set; } = new List<TurmaProfessorDisciplina>();
    public ICollection<AgendaEvento> EventosAgenda { get; set; } = new List<AgendaEvento>();
    public ICollection<MaterialApoio> MateriaisApoio { get; set; } = new List<MaterialApoio>();
}