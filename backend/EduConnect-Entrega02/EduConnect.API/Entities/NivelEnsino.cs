namespace EduConnect.Api.Entities;

public class NivelEnsino
{
    public int NivelEnsinoId { get; set; }
    public string Nome { get; set; } = string.Empty;

    public ICollection<Disciplina> Disciplinas { get; set; } = new List<Disciplina>();
    public ICollection<Turma> Turmas { get; set; } = new List<Turma>();
}