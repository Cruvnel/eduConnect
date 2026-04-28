namespace EduConnect.Api.Entities;

public class Nota
{
    public int NotaId { get; set; }
    public int AlunoId { get; set; }
    public int TurmaId { get; set; }
    public int DisciplinaId { get; set; }
    public string TipoAvaliacao { get; set; } = string.Empty; // P1, P2, T1, T2, REC
    public decimal Valor { get; set; }
    public int LancadoPorProfessorId { get; set; }
    public DateTime DataLancamento { get; set; } = DateTime.UtcNow;

    public Aluno Aluno { get; set; } = null!;
    public Turma Turma { get; set; } = null!;
    public Disciplina Disciplina { get; set; } = null!;
    public Professor LancadoPorProfessor { get; set; } = null!;
    public ICollection<NotaHistorico> Historico { get; set; } = new List<NotaHistorico>();
}

public class NotaHistorico
{
    public int NotaHistoricoId { get; set; }
    public int NotaId { get; set; }
    public decimal ValorAnterior { get; set; }
    public decimal ValorNovo { get; set; }
    public int AlteradoPorUsuarioId { get; set; }
    public DateTime DataAlteracao { get; set; } = DateTime.UtcNow;
    public string? Motivo { get; set; }

    public Nota Nota { get; set; } = null!;
    public Usuario AlteradoPorUsuario { get; set; } = null!;
}