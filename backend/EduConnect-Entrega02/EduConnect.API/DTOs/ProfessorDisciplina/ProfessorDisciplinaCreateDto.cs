namespace EduConnect.Api.DTOs.ProfessorDisciplina;

public class ProfessorDisciplinaCreateDto
{
    public int DisciplinaId { get; set; }
    public int NivelEnsinoId { get; set; }
    public int CargaHorariaSemanal { get; set; }
}