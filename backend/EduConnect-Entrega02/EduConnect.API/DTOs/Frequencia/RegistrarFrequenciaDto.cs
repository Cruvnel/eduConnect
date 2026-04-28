namespace EduConnect.Api.DTOs.Frequencia;

public class RegistrarFrequenciaDto
{
    public DateTime DataAula { get; set; }
    public List<FrequenciaAlunoDto> Alunos { get; set; } = new();
}