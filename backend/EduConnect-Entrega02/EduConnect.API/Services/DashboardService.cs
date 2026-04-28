using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Dashboard;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardResponseDto> ObterDashboardAdminAsync()
    {
        var turmasAtivas = await _context.Turmas.CountAsync(t => t.Ativa);

        var turmas = await _context.Turmas
            .Include(t => t.NivelEnsino)
            .ToListAsync();

        var frequencias = await _context.Frequencias
            .Include(f => f.Turma)
                .ThenInclude(t => t.NivelEnsino)
            .ToListAsync();

        var notas = await _context.Notas
            .Include(n => n.Turma)
                .ThenInclude(t => t.NivelEnsino)
            .ToListAsync();

        bool EhFundamental(string? nomeNivel) =>
            !string.IsNullOrWhiteSpace(nomeNivel) &&
            nomeNivel.Contains("Fundamental", StringComparison.OrdinalIgnoreCase);

        bool EhMedio(string? nomeNivel) =>
            !string.IsNullOrWhiteSpace(nomeNivel) &&
            nomeNivel.Contains("Médio", StringComparison.OrdinalIgnoreCase);

        decimal CalcularMediaPorNivel(Func<string?, bool> filtroNivel)
        {
            var notasBase = notas
                .Where(n =>
                    filtroNivel(n.Turma?.NivelEnsino?.Nome) &&
                    (n.TipoAvaliacao == "P1" ||
                     n.TipoAvaliacao == "P2" ||
                     n.TipoAvaliacao == "T1" ||
                     n.TipoAvaliacao == "T2"))
                .Select(n => n.Valor)
                .ToList();

            if (!notasBase.Any())
                return 0;

            return Math.Round(notasBase.Average(), 2);
        }

        decimal CalcularFrequenciaPorNivel(Func<string?, bool> filtroNivel)
        {
            var lista = frequencias
                .Where(f => filtroNivel(f.Turma?.NivelEnsino?.Nome))
                .ToList();

            if (!lista.Any())
                return 0;

            var presencas = lista.Count(f => f.Presente);
            return Math.Round((decimal)presencas / lista.Count * 100, 2);
        }

        decimal CalcularAprovacaoPorNivel(Func<string?, bool> filtroNivel)
        {
            var notasNivel = notas
                .Where(n => filtroNivel(n.Turma?.NivelEnsino?.Nome))
                .ToList();

            var grupos = notasNivel
                .GroupBy(n => new { n.AlunoId, n.DisciplinaId, n.TurmaId })
                .ToList();

            if (!grupos.Any())
                return 0;

            int aprovados = 0;
            int total = 0;

            foreach (var g in grupos)
            {
                decimal? ObterNota(string tipo) =>
                    g.FirstOrDefault(x => x.TipoAvaliacao == tipo)?.Valor;

                var p1 = ObterNota("P1");
                var p2 = ObterNota("P2");
                var t1 = ObterNota("T1");
                var t2 = ObterNota("T2");
                var rec = ObterNota("REC");

                var notasBase = new List<decimal>();

                if (p1.HasValue) notasBase.Add(p1.Value);
                if (p2.HasValue) notasBase.Add(p2.Value);
                if (t1.HasValue) notasBase.Add(t1.Value);
                if (t2.HasValue) notasBase.Add(t2.Value);

                if (!notasBase.Any())
                    continue;

                total++;

                var media = Math.Round(notasBase.Average(), 2);
                var aprovado = media >= 6 || (rec.HasValue && rec.Value >= 6);

                if (aprovado)
                    aprovados++;
            }

            if (total == 0)
                return 0;

            return Math.Round((decimal)aprovados / total * 100, 2);
        }

        return new AdminDashboardResponseDto
        {
            TurmasAtivas = turmasAtivas,

            MediaGeralFundamental = CalcularMediaPorNivel(EhFundamental),
            MediaGeralMedio = CalcularMediaPorNivel(EhMedio),

            FrequenciaMediaFundamental = CalcularFrequenciaPorNivel(EhFundamental),
            FrequenciaMediaMedio = CalcularFrequenciaPorNivel(EhMedio),

            TaxaAprovacaoFundamental = CalcularAprovacaoPorNivel(EhFundamental),
            TaxaAprovacaoMedio = CalcularAprovacaoPorNivel(EhMedio)
        };
    }
}