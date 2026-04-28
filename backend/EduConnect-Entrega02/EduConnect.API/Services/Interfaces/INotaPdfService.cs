using EduConnect.Api.DTOs.Nota;

namespace EduConnect.Api.Services.Interfaces;

public interface INotaPdfService
{
    byte[] GerarNotasProfessorPdf(NotasProfessorResumoDto dados);
}