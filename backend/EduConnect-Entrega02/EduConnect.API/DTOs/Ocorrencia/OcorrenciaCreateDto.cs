namespace EduConnect.Api.DTOs.Ocorrencia;

public class OcorrenciaCreateDto
{
    public int TurmaId { get; set; }
    public int AlunoId { get; set; }
    public string Descricao { get; set; } = string.Empty;
}