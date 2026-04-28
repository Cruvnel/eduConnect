using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Relatorio;
using EduConnect.Api.Helpers;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class RelatorioService : IRelatorioService
{
    private readonly AppDbContext _context;

    public RelatorioService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SituacaoAlunosRelatorioDto> ObterSituacaoAlunosAsync()
    {
        var alunosAtivos = await _context.TurmasAluno
            .Where(ta => ta.Ativo)
            .Select(ta => new { ta.AlunoId, ta.TurmaId })
            .ToListAsync();

        var totalAlunos = alunosAtivos
            .Select(x => x.AlunoId)
            .Distinct()
            .Count();

        if (totalAlunos == 0)
        {
            return new SituacaoAlunosRelatorioDto
            {
                TotalAlunos = 0,
                Aprovados = 0,
                Recuperacao = 0,
                Reprovados = 0
            };
        }

        var notas = await _context.Notas
            .Include(n => n.Disciplina)
            .Where(n => alunosAtivos.Select(a => a.AlunoId).Contains(n.AlunoId))
            .ToListAsync();

        var situacoesPorAluno = notas
    .GroupBy(n => new { n.AlunoId, n.DisciplinaId })
    .Select(g =>
    {
        decimal? ObterNota(string tipo) =>
            g.FirstOrDefault(x => x.TipoAvaliacao == tipo)?.Valor;

        var p1 = ObterNota("P1");
        var p2 = ObterNota("P2");
        var t1 = ObterNota("T1");
        var t2 = ObterNota("T2");
        var rec = ObterNota("REC");

        var situacao = SituacaoAcademicaHelper.CalcularSituacaoDisciplina(
            p1,
            p2,
            t1,
            t2,
            rec
        );

        return new
        {
            g.Key.AlunoId,
            Situacao = situacao
        };
    })
        .GroupBy(x => x.AlunoId)
        .ToDictionary(
            g => g.Key,
            g => g.Select(x => x.Situacao).ToList()
        );

        var aprovados = 0;
        var recuperacao = 0;
        var reprovados = 0;

        foreach (var aluno in alunosAtivos.Select(a => a.AlunoId).Distinct())
        {
            var situacoes = situacoesPorAluno.TryGetValue(aluno, out var listaSituacoes)
                ? listaSituacoes
                : new List<string>();

            var situacaoGeral = SituacaoAcademicaHelper.CalcularSituacaoGeral(situacoes);

            if (situacaoGeral == "Aprovado")
            {
                aprovados++;
            }
            else if (situacaoGeral == "Recuperação")
            {
                recuperacao++;
            }
            else
            {
                reprovados++;
            }
        }

        return new SituacaoAlunosRelatorioDto
        {
            TotalAlunos = totalAlunos,
            Aprovados = aprovados,
            Recuperacao = recuperacao,
            Reprovados = reprovados
        };
    }

    public async Task<List<AprovacoesPorTurmaDto>> ObterAprovacoesPorTurmaAsync()
    {
        var turmasAtivas = await _context.Turmas
            .OrderBy(t => t.Nome)
            .ToListAsync();

        var turmasAlunoAtivos = await _context.TurmasAluno
            .Where(ta => ta.Ativo)
            .ToListAsync();

        var notas = await _context.Notas
            .ToListAsync();

        var resultado = new List<AprovacoesPorTurmaDto>();

        foreach (var turma in turmasAtivas)
        {
            var alunosDaTurma = turmasAlunoAtivos
                .Where(ta => ta.TurmaId == turma.TurmaId)
                .Select(ta => ta.AlunoId)
                .Distinct()
                .ToList();

            var totalAlunos = alunosDaTurma.Count;

            if (totalAlunos == 0)
            {
                resultado.Add(new AprovacoesPorTurmaDto
                {
                    TurmaId = turma.TurmaId,
                    TurmaNome = turma.Nome,
                    AnoLetivo = turma.AnoLetivo,
                    TotalAlunos = 0,
                    Aprovados = 0,
                    Recuperacao = 0,
                    Reprovados = 0
                });

                continue;
            }

            var notasDaTurma = notas
                .Where(n => n.TurmaId == turma.TurmaId && alunosDaTurma.Contains(n.AlunoId))
                .ToList();

            var situacoesPorAluno = notasDaTurma
    .GroupBy(n => new { n.AlunoId, n.DisciplinaId })
    .Select(g =>
    {
        decimal? ObterNota(string tipo) =>
            g.FirstOrDefault(x => x.TipoAvaliacao == tipo)?.Valor;

        var p1 = ObterNota("P1");
        var p2 = ObterNota("P2");
        var t1 = ObterNota("T1");
        var t2 = ObterNota("T2");
        var rec = ObterNota("REC");

        var situacao = SituacaoAcademicaHelper.CalcularSituacaoDisciplina(
            p1,
            p2,
            t1,
            t2,
            rec
        );

        return new
        {
            g.Key.AlunoId,
            Situacao = situacao
        };
    })
        .GroupBy(x => x.AlunoId)
        .ToDictionary(
            g => g.Key,
            g => g.Select(x => x.Situacao).ToList()
        );

            var aprovados = 0;
            var recuperacao = 0;
            var reprovados = 0;

            foreach (var alunoId in alunosDaTurma)
            {
                var situacoes = situacoesPorAluno.TryGetValue(alunoId, out var listaSituacoes)
                    ? listaSituacoes
                    : new List<string>();

                var situacaoGeral = SituacaoAcademicaHelper.CalcularSituacaoGeral(situacoes);

                if (situacaoGeral == "Aprovado")
                {
                    aprovados++;
                }
                else if (situacaoGeral == "Recuperação")
                {
                    recuperacao++;
                }
                else
                {
                    reprovados++;
                }
            }

            resultado.Add(new AprovacoesPorTurmaDto
            {
                TurmaId = turma.TurmaId,
                TurmaNome = turma.Nome,
                AnoLetivo = turma.AnoLetivo,
                TotalAlunos = totalAlunos,
                Aprovados = aprovados,
                Recuperacao = recuperacao,
                Reprovados = reprovados
            });
        }

        return resultado;
    }

    public async Task<List<MediaPorDisciplinaDto>> ObterMediaPorDisciplinaAsync()
    {
        var tiposConsiderados = new[] { "P1", "P2", "T1", "T2" };

        var notas = await _context.Notas
            .Include(n => n.Disciplina)
                .ThenInclude(d => d.NivelEnsino)
            .Where(n => tiposConsiderados.Contains(n.TipoAvaliacao))
            .ToListAsync();

        var resultado = notas
            .GroupBy(n => new
            {
                n.DisciplinaId,
                n.Disciplina.Nome,
                NivelEnsino = n.Disciplina.NivelEnsino.Nome
            })
            .Select(g => new MediaPorDisciplinaDto
            {
                DisciplinaId = g.Key.DisciplinaId,
                DisciplinaNome = g.Key.Nome,
                NivelEnsino = g.Key.NivelEnsino,
                QuantidadeNotasConsideradas = g.Count(),
                MediaGeral = Math.Round(g.Average(x => x.Valor), 2)
            })
            .OrderBy(x => x.DisciplinaNome)
            .ToList();

        return resultado;
    }

    public async Task<FrequenciaMediaDto> ObterFrequenciaMediaAsync()
    {
        var totalRegistros = await _context.Frequencias.CountAsync();

        if (totalRegistros == 0)
        {
            return new FrequenciaMediaDto
            {
                TotalRegistros = 0,
                TotalPresencas = 0,
                TotalAusencias = 0,
                FrequenciaMediaPercentual = 0
            };
        }

        var totalPresencas = await _context.Frequencias.CountAsync(f => f.Presente);
        var totalAusencias = totalRegistros - totalPresencas;

        var frequenciaMedia = Math.Round((decimal)totalPresencas / totalRegistros * 100, 2);

        return new FrequenciaMediaDto
        {
            TotalRegistros = totalRegistros,
            TotalPresencas = totalPresencas,
            TotalAusencias = totalAusencias,
            FrequenciaMediaPercentual = frequenciaMedia
        };
    }
}