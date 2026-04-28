using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Nota;
using EduConnect.Api.Entities;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class NotaService : INotaService
{
    private readonly AppDbContext _context;

    private static readonly HashSet<string> TiposPermitidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "P1", "P2", "T1", "T2", "REC"
    };

    public NotaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<NotaResponseDto>> RegistrarAsync(int usuarioId, RegistrarNotasDto request)
    {
        if (request.TurmaId <= 0)
            throw new ArgumentException("Turma é obrigatória.");

        if (string.IsNullOrWhiteSpace(request.TipoAvaliacao))
            throw new ArgumentException("Tipo de avaliação é obrigatório.");

        if (!TiposPermitidos.Contains(request.TipoAvaliacao))
            throw new ArgumentException("Tipo de avaliação inválido. Use P1, P2, T1, T2 ou REC.");

        if (request.Alunos is null || request.Alunos.Count == 0)
            throw new ArgumentException("É obrigatório informar os alunos e suas notas.");

        foreach (var item in request.Alunos)
        {
            if (item.Valor < 0 || item.Valor > 10)
                throw new ArgumentException("A nota deve estar entre 0 e 10.");
        }

        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var turma = await _context.Turmas
            .FirstOrDefaultAsync(t => t.TurmaId == request.TurmaId);

        if (turma is null)
            throw new KeyNotFoundException("Turma não encontrada.");

        var vinculoProfessorTurma = await _context.TurmasProfessoresDisciplinas
            .Include(x => x.Disciplina)
            .FirstOrDefaultAsync(x => x.TurmaId == request.TurmaId && x.ProfessorId == professor.ProfessorId);

        if (vinculoProfessorTurma is null)
            throw new InvalidOperationException("Professor não está vinculado a essa turma.");

        var disciplinaId = vinculoProfessorTurma.DisciplinaId;
        var disciplinaNome = vinculoProfessorTurma.Disciplina.Nome;
        var tipoAvaliacao = request.TipoAvaliacao.Trim().ToUpper();

        var alunosAtivosNaTurma = await _context.TurmasAluno
            .Include(x => x.Aluno)
            .Where(x => x.TurmaId == request.TurmaId && x.Ativo)
            .ToListAsync();

        var alunosIdsNaTurma = alunosAtivosNaTurma
            .Select(x => x.AlunoId)
            .ToHashSet();

        foreach (var item in request.Alunos)
        {
            if (!alunosIdsNaTurma.Contains(item.AlunoId))
                throw new InvalidOperationException($"O aluno {item.AlunoId} não pertence à turma informada.");
        }

        var notasProcessadas = new List<Nota>();

        foreach (var item in request.Alunos)
        {
            var notaExistente = await _context.Notas
                .FirstOrDefaultAsync(n =>
                    n.TurmaId == request.TurmaId &&
                    n.AlunoId == item.AlunoId &&
                    n.DisciplinaId == disciplinaId &&
                    n.TipoAvaliacao == tipoAvaliacao);

            if (notaExistente is not null)
            {
                if (notaExistente.Valor != item.Valor)
                {
                    var historico = new NotaHistorico
                    {
                        NotaId = notaExistente.NotaId,
                        ValorAnterior = notaExistente.Valor,
                        ValorNovo = item.Valor,
                        AlteradoPorUsuarioId = usuarioId,
                        DataAlteracao = DateTime.UtcNow,
                        Motivo = string.IsNullOrWhiteSpace(request.MotivoAlteracao)
                            ? "Atualização de nota"
                            : request.MotivoAlteracao.Trim()
                    };

                    _context.NotasHistorico.Add(historico);

                    notaExistente.Valor = item.Valor;
                    notaExistente.DataLancamento = DateTime.UtcNow;
                }

                notasProcessadas.Add(notaExistente);
            }
            else
            {
                var novaNota = new Nota
                {
                    AlunoId = item.AlunoId,
                    TurmaId = request.TurmaId,
                    DisciplinaId = disciplinaId,
                    TipoAvaliacao = tipoAvaliacao,
                    Valor = item.Valor,
                    LancadoPorProfessorId = professor.ProfessorId,
                    DataLancamento = DateTime.UtcNow
                };

                _context.Notas.Add(novaNota);
                notasProcessadas.Add(novaNota);
            }
        }

        await _context.SaveChangesAsync();

        var alunosDaResposta = await _context.Alunos
            .Where(a => request.Alunos.Select(x => x.AlunoId).Contains(a.AlunoId))
            .ToDictionaryAsync(a => a.AlunoId, a => a.NomeCompleto);

        return notasProcessadas
            .Select(n => new NotaResponseDto
            {
                NotaId = n.NotaId,
                TurmaId = turma.TurmaId,
                TurmaNome = turma.Nome,
                AlunoId = n.AlunoId,
                AlunoNome = alunosDaResposta.TryGetValue(n.AlunoId, out var nomeAluno) ? nomeAluno : string.Empty,
                DisciplinaId = disciplinaId,
                DisciplinaNome = disciplinaNome,
                TipoAvaliacao = n.TipoAvaliacao,
                Valor = n.Valor,
                LancadoPorProfessorId = professor.ProfessorId,
                DataLancamento = n.DataLancamento
            })
            .OrderBy(x => x.AlunoNome)
            .ToList();
    }

    public async Task<List<NotaResponseDto>> ListarPorTurmaAsync(int turmaId, int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var vinculoProfessorTurma = await _context.TurmasProfessoresDisciplinas
            .Include(x => x.Turma)
            .Include(x => x.Disciplina)
            .FirstOrDefaultAsync(x => x.TurmaId == turmaId && x.ProfessorId == professor.ProfessorId);

        if (vinculoProfessorTurma is null)
            throw new InvalidOperationException("Professor não está vinculado a essa turma.");

        return await _context.Notas
            .Include(n => n.Aluno)
            .Where(n =>
                n.TurmaId == turmaId &&
                n.DisciplinaId == vinculoProfessorTurma.DisciplinaId &&
                n.LancadoPorProfessorId == professor.ProfessorId)
            .OrderBy(n => n.Aluno.NomeCompleto)
            .ThenBy(n => n.TipoAvaliacao)
            .Select(n => new NotaResponseDto
            {
                NotaId = n.NotaId,
                TurmaId = n.TurmaId,
                TurmaNome = vinculoProfessorTurma.Turma.Nome,
                AlunoId = n.AlunoId,
                AlunoNome = n.Aluno.NomeCompleto,
                DisciplinaId = n.DisciplinaId,
                DisciplinaNome = vinculoProfessorTurma.Disciplina.Nome,
                TipoAvaliacao = n.TipoAvaliacao,
                Valor = n.Valor,
                LancadoPorProfessorId = n.LancadoPorProfessorId,
                DataLancamento = n.DataLancamento
            })
            .ToListAsync();
    }

    public async Task<NotaResponseDto> AtualizarAsync(int notaId, int usuarioId, AtualizarNotaDto request)
    {
        if (request.Valor < 0 || request.Valor > 10)
            throw new ArgumentException("A nota deve estar entre 0 e 10.");

        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var nota = await _context.Notas
            .Include(n => n.Aluno)
            .Include(n => n.Turma)
            .Include(n => n.Disciplina)
            .FirstOrDefaultAsync(n => n.NotaId == notaId);

        if (nota is null)
            throw new KeyNotFoundException("Nota não encontrada.");

        if (nota.LancadoPorProfessorId != professor.ProfessorId)
            throw new InvalidOperationException("Professor não pode editar essa nota.");

        if (nota.Valor != request.Valor)
        {
            var historico = new NotaHistorico
            {
                NotaId = nota.NotaId,
                ValorAnterior = nota.Valor,
                ValorNovo = request.Valor,
                AlteradoPorUsuarioId = usuarioId,
                DataAlteracao = DateTime.UtcNow,
                Motivo = string.IsNullOrWhiteSpace(request.MotivoAlteracao)
                    ? "Atualização manual de nota"
                    : request.MotivoAlteracao.Trim()
            };

            _context.NotasHistorico.Add(historico);

            nota.Valor = request.Valor;
            nota.DataLancamento = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        return new NotaResponseDto
        {
            NotaId = nota.NotaId,
            TurmaId = nota.TurmaId,
            TurmaNome = nota.Turma.Nome,
            AlunoId = nota.AlunoId,
            AlunoNome = nota.Aluno.NomeCompleto,
            DisciplinaId = nota.DisciplinaId,
            DisciplinaNome = nota.Disciplina.Nome,
            TipoAvaliacao = nota.TipoAvaliacao,
            Valor = nota.Valor,
            LancadoPorProfessorId = nota.LancadoPorProfessorId,
            DataLancamento = nota.DataLancamento
        };
    }

    public async Task<NotasProfessorResumoDto> ListarMinhasTurmasAsync(int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var notas = await _context.Notas
            .Include(n => n.Aluno)
            .Include(n => n.Turma)
            .Include(n => n.Disciplina)
            .Where(n => n.LancadoPorProfessorId == professor.ProfessorId)
            .OrderBy(n => n.Turma.Nome)
            .ThenBy(n => n.Disciplina.Nome)
            .ThenBy(n => n.Aluno.NomeCompleto)
            .ThenBy(n => n.TipoAvaliacao)
            .ToListAsync();

        var turmas = notas
        .GroupBy(n => new
        {
            n.TurmaId,
            TurmaNome = n.Turma.Nome,
            n.DisciplinaId,
            DisciplinaNome = n.Disciplina.Nome
        })
        .Select(g => new NotaTurmaResumoDto
        {
            TurmaId = g.Key.TurmaId,
            TurmaNome = g.Key.TurmaNome,
            DisciplinaId = g.Key.DisciplinaId,
            DisciplinaNome = g.Key.DisciplinaNome,
            Notas = g.Select(n => new NotaResponseDto
            {
                NotaId = n.NotaId,
                TurmaId = n.TurmaId,
                TurmaNome = n.Turma.Nome,
                AlunoId = n.AlunoId,
                AlunoNome = n.Aluno.NomeCompleto,
                DisciplinaId = n.DisciplinaId,
                DisciplinaNome = n.Disciplina.Nome,
                TipoAvaliacao = n.TipoAvaliacao,
                Valor = n.Valor,
                LancadoPorProfessorId = n.LancadoPorProfessorId,
                DataLancamento = n.DataLancamento
            }).ToList()
        })
        .ToList();

        return new NotasProfessorResumoDto
        {
            ProfessorId = professor.ProfessorId,
            ProfessorNome = professor.NomeCompleto,
            Turmas = turmas
        };
    }

    public async Task<List<HistoricoNotaResponseDto>> ListarHistoricoAsync(int notaId, int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var nota = await _context.Notas
            .FirstOrDefaultAsync(n => n.NotaId == notaId);

        if (nota is null)
            throw new KeyNotFoundException("Nota não encontrada.");

        var professorVinculado = await _context.TurmasProfessoresDisciplinas
            .AnyAsync(tp =>
                tp.ProfessorId == professor.ProfessorId &&
                tp.TurmaId == nota.TurmaId &&
                tp.DisciplinaId == nota.DisciplinaId);

        if (!professorVinculado)
            throw new InvalidOperationException("A nota não pertence ao professor autenticado.");

        return await _context.NotasHistorico
            .Where(h => h.NotaId == notaId)
            .OrderByDescending(h => h.DataAlteracao)
            .Select(h => new HistoricoNotaResponseDto
            {
                HistoricoNotaId = h.NotaHistoricoId,
                NotaId = h.NotaId,
                ValorAnterior = h.ValorAnterior,
                ValorNovo = h.ValorNovo,
                DataAlteracao = h.DataAlteracao,
                Motivo = h.Motivo
            })
            .ToListAsync();
    }
}