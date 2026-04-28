namespace EduConnect.Api.Entities;

public class Professor
{
    public int ProfessorId { get; set; }
    public int UsuarioId { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public DateTime DataNascimento { get; set; }
    public string Registro { get; set; } = string.Empty;
    public string EmailInstitucional { get; set; } = string.Empty;
    public string Status { get; set; } = "Ativo";

    public Usuario Usuario { get; set; } = null!;
    public ICollection<ProfessorDisciplina> ProfessorDisciplinas { get; set; } = new List<ProfessorDisciplina>();
    public ICollection<TurmaProfessorDisciplina> TurmaProfessorDisciplinas { get; set; } = new List<TurmaProfessorDisciplina>();
}