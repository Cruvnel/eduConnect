namespace EduConnect.Api.DTOs.Frequencia;

public class FrequenciaAlunoDto
{
    public int AlunoId { get; set; }
    public bool Presente { get; set; }
    public string? Observacao { get; set; }
}