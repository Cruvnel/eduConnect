namespace EduConnect.Api.Helpers;

public static class SituacaoAcademicaHelper
{
    public static bool PossuiNotasRegularesCompletas(
        decimal? p1,
        decimal? p2,
        decimal? t1,
        decimal? t2)
    {
        return p1.HasValue &&
               p2.HasValue &&
               t1.HasValue &&
               t2.HasValue;
    }

    public static decimal CalcularMediaRegular(
        decimal? p1,
        decimal? p2,
        decimal? t1,
        decimal? t2)
    {
        var notaP1 = p1 ?? 0;
        var notaP2 = p2 ?? 0;
        var notaT1 = t1 ?? 0;
        var notaT2 = t2 ?? 0;

        return Math.Round((notaP1 + notaP2 + notaT1 + notaT2) / 4, 2);
    }

    public static string CalcularSituacaoDisciplina(
        decimal? p1,
        decimal? p2,
        decimal? t1,
        decimal? t2,
        decimal? rec)
    {
        if (!PossuiNotasRegularesCompletas(p1, p2, t1, t2))
            return "Em análise";

        var media = CalcularMediaRegular(p1, p2, t1, t2);

        if (media >= 6)
            return "Aprovado";

        if (!rec.HasValue)
            return "Recuperação";

        return "Reprovado";
    }

    public static string CalcularSituacaoGeral(IEnumerable<string> situacoesDisciplinas)
    {
        var situacoes = situacoesDisciplinas.ToList();

        if (situacoes.Any(s => s == "Reprovado"))
            return "Reprovado";

        var qtdRecuperacao = situacoes.Count(s => s == "Recuperação");

        if (qtdRecuperacao > 3)
            return "Reprovado";

        if (qtdRecuperacao > 0)
            return "Recuperação";

        if (situacoes.Any(s => s == "Em análise"))
            return "Em análise";

        return "Aprovado";
    }
}