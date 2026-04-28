using EduConnect.Api.Data;
using EduConnect.Api.DTOs.InteresseMatricula;
using EduConnect.Api.Entities;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class InteresseMatriculaService : IInteresseMatriculaService
{
    private readonly AppDbContext _context;

    public InteresseMatriculaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<InteresseMatriculaResponseDto> CriarAsync(InteresseMatriculaCreateDto request)
    {
        Validar(request);

        var interesse = new InteresseMatricula
        {
            NomeResponsavel = request.NomeResponsavel.Trim(),
            DataNascimentoResponsavel = request.DataNascimentoResponsavel,
            EmailContato = request.EmailContato.Trim().ToLower(),
            Telefone = request.Telefone.Trim(),
            DocumentoResponsavelUrl = string.IsNullOrWhiteSpace(request.DocumentoResponsavelUrl)
                ? null
                : request.DocumentoResponsavelUrl.Trim(),
            NomeAluno = request.NomeAluno.Trim(),
            DataNascimentoAluno = request.DataNascimentoAluno,
            AnoEscolarAtual = request.AnoEscolarAtual.Trim(),
            DocumentoAlunoUrl = string.IsNullOrWhiteSpace(request.DocumentoAlunoUrl)
                ? null
                : request.DocumentoAlunoUrl.Trim(),
            Observacoes = string.IsNullOrWhiteSpace(request.Observacoes)
                ? null
                : request.Observacoes.Trim(),
            Status = "Pendente",
            DataSolicitacao = DateTime.UtcNow
        };

        _context.InteressesMatricula.Add(interesse);
        await _context.SaveChangesAsync();

        var administradores = await _context.Usuarios
            .Include(u => u.Perfil)
            .Where(u => u.Perfil.Nome == "Administrador" && u.Ativo)
            .ToListAsync();

        foreach (var administrador in administradores)
        {
            var notificacao = new Notificacao
            {
                RemetenteUsuarioId = administrador.UsuarioId,
                DestinatarioUsuarioId = administrador.UsuarioId,
                Tipo = "NOVO_INTERESSE_MATRICULA",
                Titulo = "Novo interesse de matrícula",
                Mensagem = $"Novo interesse de matrícula recebido para o aluno {interesse.NomeAluno}.",
                DataEnvio = DateTime.UtcNow,
                Lida = false,
                DataLeitura = null,
                EntidadeReferencia = "InteresseMatricula",
                EntidadeReferenciaId = interesse.InteresseMatriculaId
            };

            _context.Notificacoes.Add(notificacao);
        }

        await _context.SaveChangesAsync();

        return Mapear(interesse);
    }

    public async Task<List<InteresseMatriculaResponseDto>> ListarAsync()
    {
        return await _context.InteressesMatricula
        .OrderBy(i => i.Status == "Feito")
        .ThenByDescending(i => i.DataSolicitacao)
        .Select(i => new InteresseMatriculaResponseDto
        {
            InteresseMatriculaId = i.InteresseMatriculaId,
            NomeResponsavel = i.NomeResponsavel,
            DataNascimentoResponsavel = i.DataNascimentoResponsavel,
            EmailContato = i.EmailContato,
            Telefone = i.Telefone,
            DocumentoResponsavelUrl = i.DocumentoResponsavelUrl,
            NomeAluno = i.NomeAluno,
            DataNascimentoAluno = i.DataNascimentoAluno,
            AnoEscolarAtual = i.AnoEscolarAtual,
            DocumentoAlunoUrl = i.DocumentoAlunoUrl,
            Observacoes = i.Observacoes,
            Status = i.Status,
            DataSolicitacao = i.DataSolicitacao
        })
        .ToListAsync();
    }

    public async Task<InteresseMatriculaResponseDto?> ObterPorIdAsync(int id)
    {
        var interesse = await _context.InteressesMatricula
            .FirstOrDefaultAsync(i => i.InteresseMatriculaId == id);

        return interesse is null ? null : Mapear(interesse);
    }

    public async Task<InteresseMatriculaResponseDto> MarcarComoFeitoAsync(int id)
    {
        var interesse = await _context.InteressesMatricula
            .FirstOrDefaultAsync(i => i.InteresseMatriculaId == id);

        if (interesse is null)
            throw new KeyNotFoundException("Interesse de matrícula não encontrado.");

        interesse.Status = "Feito";
        await _context.SaveChangesAsync();

        return Mapear(interesse);
    }

    private static void Validar(InteresseMatriculaCreateDto request)
    {
        if (string.IsNullOrWhiteSpace(request.NomeResponsavel))
            throw new ArgumentException("Nome do responsável é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.EmailContato))
            throw new ArgumentException("Email de contato é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Telefone))
            throw new ArgumentException("Telefone é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.NomeAluno))
            throw new ArgumentException("Nome do aluno é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.AnoEscolarAtual))
            throw new ArgumentException("Ano escolar atual é obrigatório.");
    }

    private static InteresseMatriculaResponseDto Mapear(InteresseMatricula i)
    {
        return new InteresseMatriculaResponseDto
        {
            InteresseMatriculaId = i.InteresseMatriculaId,
            NomeResponsavel = i.NomeResponsavel,
            DataNascimentoResponsavel = i.DataNascimentoResponsavel,
            EmailContato = i.EmailContato,
            Telefone = i.Telefone,
            DocumentoResponsavelUrl = i.DocumentoResponsavelUrl,
            NomeAluno = i.NomeAluno,
            DataNascimentoAluno = i.DataNascimentoAluno,
            AnoEscolarAtual = i.AnoEscolarAtual,
            DocumentoAlunoUrl = i.DocumentoAlunoUrl,
            Observacoes = i.Observacoes,
            Status = i.Status,
            DataSolicitacao = i.DataSolicitacao
        };
    }
}