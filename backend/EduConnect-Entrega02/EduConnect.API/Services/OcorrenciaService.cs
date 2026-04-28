using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Ocorrencia;
using EduConnect.Api.Entities;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class OcorrenciaService : IOcorrenciaService
{
    private readonly AppDbContext _context;

    public OcorrenciaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<OcorrenciaResponseDto> CriarAsync(int usuarioId, OcorrenciaCreateDto request)
    {
        if (request.TurmaId <= 0)
            throw new ArgumentException("Turma é obrigatória.");

        if (request.AlunoId <= 0)
            throw new ArgumentException("Aluno é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Descricao))
            throw new ArgumentException("Descrição é obrigatória.");

        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var turma = await _context.Turmas
            .FirstOrDefaultAsync(t => t.TurmaId == request.TurmaId);

        if (turma is null)
            throw new KeyNotFoundException("Turma não encontrada.");

        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.AlunoId == request.AlunoId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado.");

        var professorVinculado = await _context.TurmasProfessoresDisciplinas
            .AnyAsync(x => x.TurmaId == request.TurmaId && x.ProfessorId == professor.ProfessorId);

        if (!professorVinculado)
            throw new InvalidOperationException("Professor não está vinculado a essa turma.");

        var alunoNaTurma = await _context.TurmasAluno
            .AnyAsync(x => x.TurmaId == request.TurmaId && x.AlunoId == request.AlunoId && x.Ativo);

        if (!alunoNaTurma)
            throw new InvalidOperationException("Aluno não pertence à turma informada.");

        var disciplinaNome = await _context.TurmasProfessoresDisciplinas
            .Where(x => x.TurmaId == request.TurmaId && x.ProfessorId == professor.ProfessorId)
            .Select(x => x.Disciplina.Nome)
            .FirstOrDefaultAsync();

        var ocorrencia = new Ocorrencia
        {
            ProfessorId = professor.ProfessorId,
            TurmaId = request.TurmaId,
            AlunoId = request.AlunoId,
            Descricao = request.Descricao.Trim(),
            DataOcorrencia = DateTime.UtcNow
        };

        _context.Ocorrencias.Add(ocorrencia);
        await _context.SaveChangesAsync();

        var responsaveisUsuarioIds = await _context.ResponsaveisAlunos
    .Include(ra => ra.Responsavel)
    .Where(ra => ra.AlunoId == aluno.AlunoId)
    .Select(ra => ra.Responsavel.UsuarioId)
    .ToListAsync();

        foreach (var responsavelUsuarioId in responsaveisUsuarioIds)
        {
            var notificacaoResponsavel = new Notificacao
            {
                RemetenteUsuarioId = professor.UsuarioId,
                DestinatarioUsuarioId = responsavelUsuarioId,
                Tipo = "OCORRENCIA_ALUNO",
                Titulo = "Nova ocorrência registrada",
                Mensagem = $"O professor {professor.NomeCompleto} registrou uma ocorrência para {aluno.NomeCompleto} em {disciplinaNome ?? "disciplina não informada"}.",
                DataEnvio = DateTime.UtcNow,
                Lida = false,
                DataLeitura = null,
                EntidadeReferencia = "Ocorrencia",
                EntidadeReferenciaId = ocorrencia.OcorrenciaId
            };

            _context.Notificacoes.Add(notificacaoResponsavel);
        }

        await _context.SaveChangesAsync();

        var notificacaoAluno = new Notificacao
        {
            RemetenteUsuarioId = professor.UsuarioId,
            DestinatarioUsuarioId = aluno.UsuarioId,
            Tipo = "NOVA_OCORRENCIA",
            Titulo = "Nova ocorrência registrada",
            Mensagem = $"O professor {professor.NomeCompleto} registrou uma ocorrência para você.",
            DataEnvio = DateTime.UtcNow,
            Lida = false,
            DataLeitura = null,
            EntidadeReferencia = "Ocorrencia",
            EntidadeReferenciaId = ocorrencia.OcorrenciaId
        };

        _context.Notificacoes.Add(notificacaoAluno);
        await _context.SaveChangesAsync();

        return new OcorrenciaResponseDto
        {
            OcorrenciaId = ocorrencia.OcorrenciaId,
            ProfessorId = professor.ProfessorId,
            ProfessorNome = professor.NomeCompleto,
            TurmaId = turma.TurmaId,
            TurmaNome = turma.Nome,
            AlunoId = aluno.AlunoId,
            AlunoNome = aluno.NomeCompleto,
            DisciplinaNome = disciplinaNome ?? "-",
            Descricao = ocorrencia.Descricao,
            DataOcorrencia = ocorrencia.DataOcorrencia
        };
    }

    public async Task<List<OcorrenciaResponseDto>> ListarPorTurmaAsync(int turmaId, int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var professorVinculado = await _context.TurmasProfessoresDisciplinas
            .AnyAsync(x => x.TurmaId == turmaId && x.ProfessorId == professor.ProfessorId);

        if (!professorVinculado)
            throw new InvalidOperationException("Professor não está vinculado a essa turma.");

        return await _context.Ocorrencias
            .Include(o => o.Professor)
            .Include(o => o.Turma)
            .Include(o => o.Aluno)
            .Where(o => o.TurmaId == turmaId && o.ProfessorId == professor.ProfessorId)
            .OrderByDescending(o => o.DataOcorrencia)
            .Select(o => new OcorrenciaResponseDto
            {
                OcorrenciaId = o.OcorrenciaId,
                ProfessorId = o.ProfessorId,
                ProfessorNome = o.Professor.NomeCompleto,
                TurmaId = o.TurmaId,
                TurmaNome = o.Turma.Nome,
                AlunoId = o.AlunoId,
                AlunoNome = o.Aluno.NomeCompleto,
                DisciplinaNome = _context.TurmasProfessoresDisciplinas
                    .Where(tpd => tpd.TurmaId == o.TurmaId && tpd.ProfessorId == o.ProfessorId)
                    .Select(tpd => tpd.Disciplina.Nome)
                    .FirstOrDefault() ?? "-",
                Descricao = o.Descricao,
                DataOcorrencia = o.DataOcorrencia
            })
            .ToListAsync();
    }

    public async Task<List<OcorrenciaResponseDto>> ListarPorAlunoAsync(int alunoId, int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        return await _context.Ocorrencias
            .Include(o => o.Professor)
            .Include(o => o.Turma)
            .Include(o => o.Aluno)
            .Where(o => o.AlunoId == alunoId && o.ProfessorId == professor.ProfessorId)
            .OrderByDescending(o => o.DataOcorrencia)
            .Select(o => new OcorrenciaResponseDto
            {
                OcorrenciaId = o.OcorrenciaId,
                ProfessorId = o.ProfessorId,
                ProfessorNome = o.Professor.NomeCompleto,
                TurmaId = o.TurmaId,
                TurmaNome = o.Turma.Nome,
                AlunoId = o.AlunoId,
                AlunoNome = o.Aluno.NomeCompleto,
                DisciplinaNome = _context.TurmasProfessoresDisciplinas
                    .Where(tpd => tpd.TurmaId == o.TurmaId && tpd.ProfessorId == o.ProfessorId)
                    .Select(tpd => tpd.Disciplina.Nome)
                    .FirstOrDefault() ?? "-",
                Descricao = o.Descricao,
                DataOcorrencia = o.DataOcorrencia
            })
            .ToListAsync();
    }

    public async Task<OcorrenciaResponseDto?> ObterPorIdAsync(int id, int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        return await _context.Ocorrencias
            .Include(o => o.Professor)
            .Include(o => o.Turma)
            .Include(o => o.Aluno)
            .Where(o => o.OcorrenciaId == id && o.ProfessorId == professor.ProfessorId)
            .Select(o => new OcorrenciaResponseDto
            {
                OcorrenciaId = o.OcorrenciaId,
                ProfessorId = o.ProfessorId,
                ProfessorNome = o.Professor.NomeCompleto,
                TurmaId = o.TurmaId,
                TurmaNome = o.Turma.Nome,
                AlunoId = o.AlunoId,
                AlunoNome = o.Aluno.NomeCompleto,
                DisciplinaNome = _context.TurmasProfessoresDisciplinas
                    .Where(tpd => tpd.TurmaId == o.TurmaId && tpd.ProfessorId == o.ProfessorId)
                    .Select(tpd => tpd.Disciplina.Nome)
                    .FirstOrDefault() ?? "-",
                Descricao = o.Descricao,
                DataOcorrencia = o.DataOcorrencia
            })
            .FirstOrDefaultAsync();
    }

    public async Task ExcluirAsync(int id, int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var ocorrencia = await _context.Ocorrencias
            .FirstOrDefaultAsync(o => o.OcorrenciaId == id && o.ProfessorId == professor.ProfessorId);

        if (ocorrencia is null)
            throw new KeyNotFoundException("Ocorrência não encontrada para o professor autenticado.");

        _context.Ocorrencias.Remove(ocorrencia);
        await _context.SaveChangesAsync();
    }
}