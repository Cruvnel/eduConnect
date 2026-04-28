using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Publicacao;
using EduConnect.Api.Entities;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class PublicacaoService : IPublicacaoService
{
    private readonly AppDbContext _context;

    public PublicacaoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PublicacaoResponseDto> CriarAsync(int usuarioId, PublicacaoCreateDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Titulo))
            throw new ArgumentException("Título é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Mensagem))
            throw new ArgumentException("Mensagem é obrigatória.");

        var administrador = await _context.Administradores
            .FirstOrDefaultAsync(a => a.UsuarioId == usuarioId);

        if (administrador is null)
            throw new KeyNotFoundException("Administrador não encontrado para o usuário autenticado.");

        var publicacao = new Publicacao
        {
            AdministradorId = administrador.AdministradorId,
            Titulo = request.Titulo.Trim(),
            Mensagem = request.Mensagem.Trim(),
            DataPublicacao = DateTime.UtcNow,
            Ativa = true
        };

        _context.Publicacoes.Add(publicacao);
        await _context.SaveChangesAsync();

        return new PublicacaoResponseDto
        {
            PublicacaoId = publicacao.PublicacaoId,
            Titulo = publicacao.Titulo,
            Mensagem = publicacao.Mensagem,
            DataPublicacao = publicacao.DataPublicacao,
            Ativa = publicacao.Ativa,
            CriadoPorNome = administrador.NomeCompleto
        };
    }

    public async Task<List<PublicacaoResponseDto>> ListarAsync(bool somenteAtivas = false)
    {
        var query = _context.Publicacoes
            .Include(p => p.Administrador)
            .AsQueryable();

        if (somenteAtivas)
            query = query.Where(p => p.Ativa);

        return await query
            .OrderByDescending(p => p.DataPublicacao)
            .Select(p => new PublicacaoResponseDto
            {
                PublicacaoId = p.PublicacaoId,
                Titulo = p.Titulo,
                Mensagem = p.Mensagem,
                DataPublicacao = p.DataPublicacao,
                Ativa = p.Ativa,
                CriadoPorNome = p.Administrador.NomeCompleto
            })
            .ToListAsync();
    }

    public async Task<PublicacaoResponseDto> ObterPorIdAsync(int id, bool somenteAtivas = false)
    {
        var query = _context.Publicacoes
            .Include(p => p.Administrador)
            .Where(p => p.PublicacaoId == id);

        if (somenteAtivas)
            query = query.Where(p => p.Ativa);

        var publicacao = await query.FirstOrDefaultAsync();

        if (publicacao is null)
            throw new KeyNotFoundException("Publicação não encontrada.");

        return new PublicacaoResponseDto
        {
            PublicacaoId = publicacao.PublicacaoId,
            Titulo = publicacao.Titulo,
            Mensagem = publicacao.Mensagem,
            DataPublicacao = publicacao.DataPublicacao,
            Ativa = publicacao.Ativa,
            CriadoPorNome = publicacao.Administrador.NomeCompleto
        };
    }

    public async Task RemoverAsync(int id)
    {
        var publicacao = await _context.Publicacoes
            .FirstOrDefaultAsync(p => p.PublicacaoId == id);

        if (publicacao is null)
            throw new KeyNotFoundException("Publicação não encontrada.");

        publicacao.Ativa = false;
        await _context.SaveChangesAsync();
    }

    public async Task<PublicacaoResponseDto> AtualizarAsync(int id, int usuarioId, PublicacaoUpdateDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Titulo))
            throw new ArgumentException("Título é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Mensagem))
            throw new ArgumentException("Mensagem é obrigatória.");

        var administrador = await _context.Administradores
            .FirstOrDefaultAsync(a => a.UsuarioId == usuarioId);

        if (administrador is null)
            throw new KeyNotFoundException("Administrador não encontrado para o usuário autenticado.");

        var publicacao = await _context.Publicacoes
            .Include(p => p.Administrador)
            .FirstOrDefaultAsync(p => p.PublicacaoId == id);

        if (publicacao is null)
            throw new KeyNotFoundException("Publicação não encontrada.");

        publicacao.Titulo = request.Titulo.Trim();
        publicacao.Mensagem = request.Mensagem.Trim();
        publicacao.Ativa = request.Ativa;

        await _context.SaveChangesAsync();

        return new PublicacaoResponseDto
        {
            PublicacaoId = publicacao.PublicacaoId,
            Titulo = publicacao.Titulo,
            Mensagem = publicacao.Mensagem,
            DataPublicacao = publicacao.DataPublicacao,
            Ativa = publicacao.Ativa,
            CriadoPorNome = publicacao.Administrador.NomeCompleto
        };
    }
}