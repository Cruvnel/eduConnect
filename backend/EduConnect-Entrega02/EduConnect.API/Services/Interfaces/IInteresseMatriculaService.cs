using EduConnect.Api.DTOs.InteresseMatricula;

namespace EduConnect.Api.Services.Interfaces;

public interface IInteresseMatriculaService
{
    Task<InteresseMatriculaResponseDto> CriarAsync(InteresseMatriculaCreateDto request);
    Task<List<InteresseMatriculaResponseDto>> ListarAsync();
    Task<InteresseMatriculaResponseDto?> ObterPorIdAsync(int id);
    Task<InteresseMatriculaResponseDto> MarcarComoFeitoAsync(int id);
}