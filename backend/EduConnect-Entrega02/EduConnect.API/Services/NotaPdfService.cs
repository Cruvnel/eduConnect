using EduConnect.Api.DTOs.Nota;
using EduConnect.Api.Helpers;
using EduConnect.Api.Services.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EduConnect.Api.Services;

public class NotaPdfService : INotaPdfService
{
    private static readonly string[] OrdemTipos = { "P1", "P2", "T1", "T2", "REC" };

    public byte[] GerarNotasProfessorPdf(NotasProfessorResumoDto dados)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        using var stream = new MemoryStream();

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(24);

                page.Header().Column(col =>
                {
                    col.Item().Text("EduConnect - Relatório de Notas do Professor")
                        .FontSize(18)
                        .Bold();

                    col.Item().Text($"Professor: {dados.ProfessorNome}");
                    col.Item().Text($"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}");
                });

                page.Content().PaddingTop(15).Column(col =>
                {
                    foreach (var turma in dados.Turmas)
                    {
                        var tiposDaTurma = OrdemTipos.ToList();

                        var alunosAgrupados = turma.Notas
                            .GroupBy(n => new { n.AlunoId, n.AlunoNome })
                            .OrderBy(g => g.Key.AlunoNome)
                            .Select(g => new
                            {
                                AlunoNome = g.Key.AlunoNome,
                                Notas = g
                                    .Where(n => !string.IsNullOrWhiteSpace(n.TipoAvaliacao))
                                    .GroupBy(n => n.TipoAvaliacao.Trim().ToUpper())
                                    .ToDictionary(
                                        x => x.Key,
                                        x => x
                                            .OrderByDescending(n => n.DataLancamento)
                                            .First()
                                            .Valor
                                    )
                            })
                            .ToList();

                        col.Item().PaddingTop(10)
                            .Text($"{turma.TurmaNome} - {turma.DisciplinaNome}")
                            .FontSize(14)
                            .Bold();

                        col.Item().PaddingTop(5).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(2.8f);

                                foreach (var _ in tiposDaTurma)
                                    columns.RelativeColumn(1);

                                columns.RelativeColumn(1);     // Média
                                columns.RelativeColumn(1.6f);   // Situação
                            });

                            static IContainer HeaderCell(IContainer c) =>
                                c.Border(1)
                                    .BorderColor(Colors.Blue.Lighten4)
                                    .Background(Colors.Blue.Lighten3)
                                    .Padding(5)
                                    .AlignCenter();

                            static IContainer BodyCell(IContainer c) =>
                                c.Border(1)
                                    .BorderColor(Colors.Grey.Lighten2)
                                    .Padding(5);

                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderCell).Text("Aluno").SemiBold();

                                foreach (var tipo in tiposDaTurma)
                                {
                                    header.Cell().Element(HeaderCell).Text(tipo).SemiBold();
                                }

                                header.Cell().Element(HeaderCell).Text("Média").SemiBold();
                                header.Cell().Element(HeaderCell).Text("Situação").SemiBold();
                            });

                            foreach (var aluno in alunosAgrupados)
                            {
                                var p1 = ObterNota(aluno.Notas, "P1");
                                var p2 = ObterNota(aluno.Notas, "P2");
                                var t1 = ObterNota(aluno.Notas, "T1");
                                var t2 = ObterNota(aluno.Notas, "T2");
                                var rec = ObterNota(aluno.Notas, "REC");

                                var media = SituacaoAcademicaHelper.CalcularMediaRegular(
                                    p1,
                                    p2,
                                    t1,
                                    t2
                                );

                                var situacao = SituacaoAcademicaHelper.CalcularSituacaoDisciplina(
                                    p1,
                                    p2,
                                    t1,
                                    t2,
                                    rec
                                );

                                table.Cell().Element(BodyCell).Text(aluno.AlunoNome);

                                foreach (var tipo in tiposDaTurma)
                                {
                                    var valor = aluno.Notas.TryGetValue(tipo, out var nota)
                                        ? nota.ToString("0.00")
                                        : "-";

                                    table.Cell().Element(BodyCell).AlignCenter().Text(valor);
                                }

                                table.Cell()
                                    .Element(BodyCell)
                                    .AlignCenter()
                                    .Text(media.ToString("0.00"));

                                table.Cell()
                                    .Element(BodyCell)
                                    .AlignCenter()
                                    .Text(situacao);
                            }
                        });
                    }
                });

                page.Footer()
                    .AlignCenter()
                    .Text("EduConnect");
            });
        }).GeneratePdf(stream);

        return stream.ToArray();
    }

    private static decimal? ObterNota(Dictionary<string, decimal> notas, string tipo)
    {
        return notas.TryGetValue(tipo, out var valor) ? valor : null;
    }
}