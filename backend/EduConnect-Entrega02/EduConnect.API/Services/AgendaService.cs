using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Agenda;
using EduConnect.Api.Entities;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class AgendaService : IAgendaService
{
    private readonly AppDbContext _context;

    public AgendaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AgendaResponseDto> CriarAsync(int usuarioId, AgendaCreateDto request)
    {
        if (request.TurmaId <= 0)
            throw new ArgumentException("Turma é obrigatória.");

        if (string.IsNullOrWhiteSpace(request.Titulo))
            throw new ArgumentException("Título é obrigatório.");

        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var turma = await _context.Turmas
            .FirstOrDefaultAsync(t => t.TurmaId == request.TurmaId);

        if (turma is null)
            throw new KeyNotFoundException("Turma não encontrada.");

        var professorVinculado = await _context.TurmasProfessoresDisciplinas
            .AnyAsync(x => x.TurmaId == request.TurmaId && x.ProfessorId == professor.ProfessorId);

        if (!professorVinculado)
            throw new InvalidOperationException("Professor não está vinculado a essa turma.");

        var evento = new AgendaEvento
        {
            TurmaId = request.TurmaId,
            CriadoPorProfessorId = professor.ProfessorId,
            Titulo = request.Titulo.Trim(),
            Descricao = string.IsNullOrWhiteSpace(request.Descricao) ? null : request.Descricao.Trim(),
            DataEvento = request.DataEvento
        };

        _context.EventosAgenda.Add(evento);
        await _context.SaveChangesAsync();

        var alunosDaTurma = await _context.TurmasAluno
    .Include(ta => ta.Aluno)
    .Where(ta => ta.TurmaId == request.TurmaId && ta.Ativo)
    .Select(ta => ta.Aluno.UsuarioId)
    .ToListAsync();

        foreach (var alunoUsuarioId in alunosDaTurma)
        {
            var notificacao = new Notificacao
            {
                RemetenteUsuarioId = professor.UsuarioId,
                DestinatarioUsuarioId = alunoUsuarioId,
                Tipo = "AGENDA_ATUALIZADA",
                Titulo = "Agenda atualizada",
                Mensagem = $"O professor {professor.NomeCompleto} atualizou a agenda.",
                DataEnvio = DateTime.UtcNow,
                Lida = false,
                DataLeitura = null,
                EntidadeReferencia = "AgendaEvento",
                EntidadeReferenciaId = evento.AgendaEventoId
            };

            _context.Notificacoes.Add(notificacao);
        }

        await _context.SaveChangesAsync();

        return new AgendaResponseDto
        {
            AgendaEventoId = evento.AgendaEventoId,
            TurmaId = turma.TurmaId,
            TurmaNome = turma.Nome,
            CriadoPorProfessorId = professor.ProfessorId,
            ProfessorNome = professor.NomeCompleto,
            Titulo = evento.Titulo,
            Descricao = evento.Descricao,
            DataEvento = evento.DataEvento
        };
    }

    public async Task<List<AgendaResponseDto>> ListarPorTurmaAsync(int turmaId, int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var professorVinculado = await _context.TurmasProfessoresDisciplinas
            .AnyAsync(x => x.TurmaId == turmaId && x.ProfessorId == professor.ProfessorId);

        if (!professorVinculado)
            throw new InvalidOperationException("Professor não está vinculado a essa turma.");

        return await _context.EventosAgenda
            .Include(e => e.Turma)
            .Include(e => e.CriadoPorProfessor)
            .Where(e => e.TurmaId == turmaId && e.CriadoPorProfessorId == professor.ProfessorId)
            .OrderBy(e => e.DataEvento)
            .Select(e => new AgendaResponseDto
            {
                AgendaEventoId = e.AgendaEventoId,
                TurmaId = e.TurmaId,
                TurmaNome = e.Turma.Nome,
                CriadoPorProfessorId = e.CriadoPorProfessorId,
                ProfessorNome = e.CriadoPorProfessor.NomeCompleto,
                Titulo = e.Titulo,
                Descricao = e.Descricao,
                DataEvento = e.DataEvento
            })
            .ToListAsync();
    }

    public async Task<AgendaResponseDto?> ObterPorIdAsync(int id, int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        return await _context.EventosAgenda
            .Include(e => e.Turma)
            .Include(e => e.CriadoPorProfessor)
            .Where(e => e.AgendaEventoId == id && e.CriadoPorProfessorId == professor.ProfessorId)
            .Select(e => new AgendaResponseDto
            {
                AgendaEventoId = e.AgendaEventoId,
                TurmaId = e.TurmaId,
                TurmaNome = e.Turma.Nome,
                CriadoPorProfessorId = e.CriadoPorProfessorId,
                ProfessorNome = e.CriadoPorProfessor.NomeCompleto,
                Titulo = e.Titulo,
                Descricao = e.Descricao,
                DataEvento = e.DataEvento
            })
            .FirstOrDefaultAsync();
    }

    public async Task ExcluirAsync(int id, int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var evento = await _context.EventosAgenda
            .FirstOrDefaultAsync(e => e.AgendaEventoId == id && e.CriadoPorProfessorId == professor.ProfessorId);

        if (evento is null)
            throw new KeyNotFoundException("Evento de agenda não encontrado.");

        _context.EventosAgenda.Remove(evento);
        await _context.SaveChangesAsync();
    }
}