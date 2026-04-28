using EduConnect.Api.DTOs.Relatorio;
using EduConnect.Api.Services.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EduConnect.Api.Services;

public class RelatorioPdfService : IRelatorioPdfService
{
    public byte[] GerarSituacaoAlunosPdf(SituacaoAlunosRelatorioDto dados)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        using var stream = new MemoryStream();

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(32);

                page.Header().Column(col =>
                {
                    col.Item().Text("EduConnect - Relatório de Situação dos Alunos")
                        .FontSize(18)
                        .Bold();

                    col.Item().Text($"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}");
                });

                page.Content().PaddingTop(20).Column(col =>
                {
                    col.Item().Text("Resumo Geral")
                        .FontSize(14)
                        .Bold();

                    col.Item().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(HeaderCell).Text("Indicador").SemiBold();
                            header.Cell().Element(HeaderCell).AlignCenter().Text("Valor").SemiBold();
                        });

                        table.Cell().Element(BodyCell).Text("Total de alunos");
                        table.Cell().Element(BodyCell).AlignCenter().Text(dados.TotalAlunos.ToString());

                        table.Cell().Element(BodyCell).Text("Aprovados");
                        table.Cell().Element(BodyCell).AlignCenter().Text(dados.Aprovados.ToString());

                        table.Cell().Element(BodyCell).Text("Recuperação");
                        table.Cell().Element(BodyCell).AlignCenter().Text(dados.Recuperacao.ToString());

                        table.Cell().Element(BodyCell).Text("Reprovados");
                        table.Cell().Element(BodyCell).AlignCenter().Text(dados.Reprovados.ToString());
                    });
                });

                page.Footer()
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("EduConnect");
                    });
            });
        }).GeneratePdf(stream);

        return stream.ToArray();
    }

    public byte[] GerarAprovacoesPorTurmaPdf(List<AprovacoesPorTurmaDto> dados)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        using var stream = new MemoryStream();

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(32);

                page.Header().Column(col =>
                {
                    col.Item().Text("EduConnect - Relatório de Aprovações por Turma")
                        .FontSize(18)
                        .Bold();

                    col.Item().Text($"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}");
                });

                page.Content().PaddingTop(20).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2.8f);
                            columns.RelativeColumn(0.9f);
                            columns.RelativeColumn(0.9f);
                            columns.RelativeColumn(1.3f);
                            columns.RelativeColumn(1.5f);
                            columns.RelativeColumn(1.3f);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(HeaderCell).Text("Turma").SemiBold();
                            header.Cell().Element(HeaderCell).Text("Ano").SemiBold();
                            header.Cell().Element(HeaderCell).Text("Total").SemiBold();
                            header.Cell().Element(HeaderCell).Text("Aprovados").SemiBold();
                            header.Cell().Element(HeaderCell).Text("Recuperação").SemiBold();
                            header.Cell().Element(HeaderCell).Text("Reprovados").SemiBold();
                        });

                        foreach (var item in dados)
                        {
                            table.Cell().Element(BodyCell).Text(item.TurmaNome);
                            table.Cell().Element(BodyCell).AlignCenter().Text(item.AnoLetivo.ToString());
                            table.Cell().Element(BodyCell).AlignCenter().Text(item.TotalAlunos.ToString());
                            table.Cell().Element(BodyCell).AlignCenter().Text(item.Aprovados.ToString());
                            table.Cell().Element(BodyCell).AlignCenter().Text(item.Recuperacao.ToString());
                            table.Cell().Element(BodyCell).AlignCenter().Text(item.Reprovados.ToString());
                        }
                    });
                });

                page.Footer()
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("EduConnect");
                    });
            });
        }).GeneratePdf(stream);

        return stream.ToArray();
    }

    public byte[] GerarMediaPorDisciplinaPdf(List<MediaPorDisciplinaDto> dados)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        using var stream = new MemoryStream();

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(32);

                page.Header().Column(col =>
                {
                    col.Item().Text("EduConnect - Relatório de Média por Disciplina")
                        .FontSize(18)
                        .Bold();

                    col.Item().Text($"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}");
                });

                page.Content().PaddingTop(20).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2.2f);
                            columns.RelativeColumn(1.5f);
                            columns.RelativeColumn(1.2f);
                            columns.RelativeColumn(1.1f);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(HeaderCell).Text("Disciplina").SemiBold();
                            header.Cell().Element(HeaderCell).Text("Nível").SemiBold();
                            header.Cell().Element(HeaderCell).Text("Qtd. Notas").SemiBold();
                            header.Cell().Element(HeaderCell).Text("Média").SemiBold();
                        });

                        foreach (var item in dados)
                        {
                            table.Cell().Element(BodyCell).Text(item.DisciplinaNome);
                            table.Cell().Element(BodyCell).Text(item.NivelEnsino);
                            table.Cell().Element(BodyCell).AlignCenter().Text(item.QuantidadeNotasConsideradas.ToString());
                            table.Cell()
                                .Element(BodyCell)
                                .AlignCenter()
                                .Text(item.MediaGeral.ToString("0.00"))
                                .FontColor(ObterCorMedia(item.MediaGeral))
                                .SemiBold();
                        }
                    });
                });

                page.Footer()
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("EduConnect");
                    });
            });
        }).GeneratePdf(stream);

        return stream.ToArray();
    }

    public byte[] GerarFrequenciaMediaPdf(FrequenciaMediaDto dados)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        using var stream = new MemoryStream();

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(32);

                page.Header().Column(col =>
                {
                    col.Item().Text("EduConnect - Relatório de Frequência Média")
                        .FontSize(18)
                        .Bold();

                    col.Item().Text($"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}");
                });

                page.Content().PaddingTop(20).Column(col =>
                {
                    col.Item().Text("Resumo Geral")
                        .FontSize(14)
                        .Bold();

                    col.Item().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1.2f);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(HeaderCell).Text("Indicador").SemiBold();
                            header.Cell().Element(HeaderCell).AlignCenter().Text("Valor").SemiBold();
                        });

                        table.Cell().Element(BodyCell).Text("Total de registros");
                        table.Cell().Element(BodyCell).AlignCenter().Text(dados.TotalRegistros.ToString());

                        table.Cell().Element(BodyCell).Text("Total de presenças");
                        table.Cell().Element(BodyCell).AlignCenter().Text(dados.TotalPresencas.ToString());

                        table.Cell().Element(BodyCell).Text("Total de ausências");
                        table.Cell().Element(BodyCell).AlignCenter().Text(dados.TotalAusencias.ToString());

                        table.Cell().Element(BodyCell).Text("Frequência média (%)");
                        table.Cell().Element(BodyCell).AlignCenter().Text(dados.FrequenciaMediaPercentual.ToString("0.00"));
                    });
                });

                page.Footer()
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("EduConnect");
                    });
            });
        }).GeneratePdf(stream);

        return stream.ToArray();
    }

    private static IContainer HeaderCell(IContainer container) =>
    container
        .Border(1)
        .BorderColor(Colors.Blue.Lighten4)
        .Background(Colors.Blue.Lighten3)
        .Padding(6)
        .AlignCenter()
        .AlignMiddle();

    private static IContainer BodyCell(IContainer container) =>
        container
            .Border(1)
            .BorderColor(Colors.Grey.Lighten2)
            .Padding(6)
            .AlignMiddle();

    private static string ObterCorMedia(decimal media)
    {
        if (media < 6)
            return Colors.Red.Darken1;

        if (media == 6)
            return Colors.Amber.Darken2;

        return Colors.Blue.Darken2;
    }
}