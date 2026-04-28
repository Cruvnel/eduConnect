using EduConnect.Api.DTOs.Publicacao;

namespace EduConnect.Api.Services.Interfaces;

public interface IPublicacaoService
{
    Task<PublicacaoResponseDto> CriarAsync(int usuarioId, PublicacaoCreateDto request);
    Task<List<PublicacaoResponseDto>> ListarAsync(bool somenteAtivas = false);
    Task<PublicacaoResponseDto> ObterPorIdAsync(int id, bool somenteAtivas = false);
    Task RemoverAsync(int id);
    Task<PublicacaoResponseDto> AtualizarAsync(int id, int usuarioId, PublicacaoUpdateDto request);
}