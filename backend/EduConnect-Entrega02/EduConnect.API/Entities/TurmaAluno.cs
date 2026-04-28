namespace EduConnect.Api.Entities;

public class TurmaAluno
{
    public int TurmaAlunoId { get; set; }
    public int TurmaId { get; set; }
    public int AlunoId { get; set; }
    public DateTime DataEntrada { get; set; }
    public DateTime? DataSaida { get; set; }
    public bool Ativo { get; set; } = true;

    public Turma Turma { get; set; } = null!;
    public Aluno Aluno { get; set; } = null!;
}