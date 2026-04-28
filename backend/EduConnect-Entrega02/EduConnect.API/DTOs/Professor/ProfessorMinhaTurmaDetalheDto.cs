public class ProfessorMinhaTurmaDetalheDto
{
    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;
    public int AnoLetivo { get; set; }
    public string Sala { get; set; } = string.Empty;
    public string NivelEnsino { get; set; } = string.Empty;
    public string ProfessorTutorNome { get; set; } = string.Empty;
    public int DisciplinaId { get; set; }
    public string DisciplinaNome { get; set; } = string.Empty;
    public int TotalAlunos { get; set; }
    public List<ProfessorMinhaTurmaAlunoDto> Alunos { get; set; } = [];
}

public class ProfessorMinhaTurmaAlunoDto
{
    public int AlunoId { get; set; }
    public string NomeCompletoAluno { get; set; } = string.Empty;
    public string RegistroAluno { get; set; } = string.Empty;
    public bool Ativo { get; set; }
}