namespace EduConnect.Api.DTOs.Upload;

public class UploadResponseDto
{
    public string NomeOriginal { get; set; } = string.Empty;
    public string NomeSalvo { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public long TamanhoBytes { get; set; }
    public string Categoria { get; set; } = string.Empty;
}