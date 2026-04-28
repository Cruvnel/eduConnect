namespace EduConnect.Api.Entities;

public class Aluno
{
    public int AlunoId { get; set; }
    public int UsuarioId { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public DateTime DataNascimento { get; set; }
    public string Registro { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }
    public decimal ValorMensalPadrao { get; set; }
    public bool Ativo { get; set; } = true;

    public Usuario Usuario { get; set; } = null!;
    public ICollection<ResponsavelAluno> ResponsaveisAlunos { get; set; } = new List<ResponsavelAluno>();
    public ICollection<TurmaAluno> TurmasAluno { get; set; } = new List<TurmaAluno>();
    public ICollection<Nota> Notas { get; set; } = new List<Nota>();
    public ICollection<Frequencia> Frequencias { get; set; } = new List<Frequencia>();
    public ICollection<Ocorrencia> Ocorrencias { get; set; } = new List<Ocorrencia>();
}