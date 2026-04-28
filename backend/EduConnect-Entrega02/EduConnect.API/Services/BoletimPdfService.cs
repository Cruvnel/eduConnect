using EduConnect.Api.DTOs.Boletim;
using EduConnect.Api.Services.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EduConnect.Api.Services;

public class BoletimPdfService : IBoletimPdfService
{
    public byte[] GerarBoletimPdf(BoletimAlunoResponseDto boletim)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var stream = new MemoryStream();

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(32);

                page.Header().Column(col =>
                {
                    col.Item().Text("EduConnect - Boletim Escolar")
                        .FontSize(18)
                        .Bold();

                    col.Item().Text($"Aluno: {boletim.NomeCompleto}");
                    col.Item().Text($"Registro: {boletim.Registro}");
                    col.Item().Text($"Turma: {boletim.TurmaNome ?? "-"}");
                    col.Item().Text($"Ano Letivo: {boletim.AnoLetivo?.ToString() ?? "-"}");
                });

                page.Content().PaddingTop(20).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2.1f); // Disciplina
                            columns.RelativeColumn(0.7f); // P1
                            columns.RelativeColumn(0.7f); // P2
                            columns.RelativeColumn(0.7f); // T1
                            columns.RelativeColumn(0.7f); // T2
                            columns.RelativeColumn(0.7f); // REC
                            columns.RelativeColumn(0.9f); // Média
                            columns.RelativeColumn(1.1f); // Frequência
                            columns.RelativeColumn(1.5f); // Situação
                        });

                        static IContainer HeaderCell(IContainer container) =>
                            container
                                .Border(1)
                                .BorderColor(Colors.Blue.Lighten4)
                                .Background(Colors.Blue.Lighten3)
                                .Padding(5)
                                .AlignCenter()
                                .AlignMiddle();

                        static IContainer BodyCell(IContainer container) =>
                            container
                                .Border(1)
                                .BorderColor(Colors.Grey.Lighten2)
                                .Padding(5)
                                .AlignMiddle();

                        table.Header(header =>
                        {
                            header.Cell().Element(HeaderCell).Text("Disciplina").SemiBold();
                            header.Cell().Element(HeaderCell).Text("P1").SemiBold();
                            header.Cell().Element(HeaderCell).Text("P2").SemiBold();
                            header.Cell().Element(HeaderCell).Text("T1").SemiBold();
                            header.Cell().Element(HeaderCell).Text("T2").SemiBold();
                            header.Cell().Element(HeaderCell).Text("REC").SemiBold();
                            header.Cell().Element(HeaderCell).Text("Média").SemiBold();
                            header.Cell().Element(HeaderCell).Text("Freq.").SemiBold();
                            header.Cell().Element(HeaderCell).Text("Situação").SemiBold();
                        });

                        foreach (var item in boletim.Disciplinas)
                        {
                            table.Cell().Element(BodyCell).Text(item.DisciplinaNome);
                            table.Cell().Element(BodyCell).AlignCenter().Text(FormatarNota(item.P1));
                            table.Cell().Element(BodyCell).AlignCenter().Text(FormatarNota(item.P2));
                            table.Cell().Element(BodyCell).AlignCenter().Text(FormatarNota(item.T1));
                            table.Cell().Element(BodyCell).AlignCenter().Text(FormatarNota(item.T2));
                            table.Cell().Element(BodyCell).AlignCenter().Text(FormatarNota(item.REC));
                            table.Cell().Element(BodyCell).AlignCenter().Text(item.MediaFinal.ToString("0.00"));
                            table.Cell().Element(BodyCell).AlignCenter().Text(FormatarFrequencia(item.FrequenciaMedia));
                            table.Cell().Element(BodyCell).AlignCenter().Text(item.Situacao);
                        }
                    });
                });

                page.Footer()
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("Gerado em ");
                        text.Span(DateTime.Now.ToString("dd/MM/yyyy HH:mm"));
                    });
            });
        }).GeneratePdf(stream);

        return stream.ToArray();
    }

    private static string FormatarNota(decimal? valor)
    {
        return valor.HasValue ? valor.Value.ToString("0.##") : "-";
    }

    private static string FormatarFrequencia(decimal? valor)
    {
        return valor.HasValue ? $"{valor.Value:0.##}%" : "-";
    }
}