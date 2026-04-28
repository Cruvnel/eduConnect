namespace EduConnect.Api.Entities;

public class ResponsavelAluno
{
    public int ResponsavelAlunoId { get; set; }
    public int ResponsavelId { get; set; }
    public int AlunoId { get; set; }
    public string? TipoResponsabilidade { get; set; }
    public bool Principal { get; set; }

    public Responsavel Responsavel { get; set; } = null!;
    public Aluno Aluno { get; set; } = null!;
}