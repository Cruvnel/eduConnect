using EduConnect.Api.DTOs.Boletim;

namespace EduConnect.Api.Services.Interfaces;

public interface IBoletimPdfService
{
    byte[] GerarBoletimPdf(BoletimAlunoResponseDto boletim);
}