using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Responsavel;
using EduConnect.Api.DTOs.Boletim;
using EduConnect.Api.DTOs.Frequencia;
using EduConnect.Api.DTOs.Ocorrencia;
using EduConnect.Api.DTOs.Agenda;
using EduConnect.Api.DTOs.Financeiro;
using EduConnect.Api.DTOs.Material;
using EduConnect.Api.Helpers;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using EduConnect.Api.DTOs.Publicacao;

namespace EduConnect.Api.Services;

public class ResponsavelService : IResponsavelService
{
    private readonly AppDbContext _context;

    public ResponsavelService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ResponsavelAlunoResumoDto>> ListarMeusAlunosAsync(int usuarioId)
    {
        var responsavel = await _context.Responsaveis
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);

        if (responsavel is null)
            throw new KeyNotFoundException("Responsável não encontrado para o usuário autenticado.");

        var vinculos = await _context.ResponsaveisAlunos
            .Include(ra => ra.Aluno)
            .Where(ra => ra.ResponsavelId == responsavel.ResponsavelId)
            .ToListAsync();

        var alunosIds = vinculos.Select(v => v.AlunoId).ToList();

        var turmasAtivas = await _context.TurmasAluno
            .Include(ta => ta.Turma)
            .Where(ta => alunosIds.Contains(ta.AlunoId) && ta.Ativo)
            .ToListAsync();

        return vinculos
            .Select(v =>
            {
                var turmaAtiva = turmasAtivas
                    .Where(t => t.AlunoId == v.AlunoId)
                    .OrderByDescending(t => t.DataEntrada)
                    .FirstOrDefault();

                return new ResponsavelAlunoResumoDto
                {
                    AlunoId = v.Aluno.AlunoId,
                    NomeCompleto = v.Aluno.NomeCompleto,
                    Registro = v.Aluno.Registro,
                    FotoUrl = v.Aluno.FotoUrl,
                    TurmaId = turmaAtiva?.TurmaId,
                    TurmaNome = turmaAtiva?.Turma?.Nome,
                    AnoLetivo = turmaAtiva?.Turma?.AnoLetivo,
                    ProfessorTutorNome = turmaAtiva?.Turma?.ProfessorTutorNome,
                    TipoResponsabilidade = v.TipoResponsabilidade,
                    ResponsavelPrincipal = v.Principal
                };
            })
            .OrderBy(x => x.NomeCompleto)
            .ToList();
    }

    public async Task<BoletimAlunoResponseDto> ObterBoletimAlunoAsync(int usuarioId, int alunoId)
    {
        var responsavel = await _context.Responsaveis
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);

        if (responsavel is null)
            throw new KeyNotFoundException("Responsável não encontrado para o usuário autenticado.");

        var vinculoResponsavelAluno = await _context.ResponsaveisAlunos
            .AnyAsync(ra => ra.ResponsavelId == responsavel.ResponsavelId && ra.AlunoId == alunoId);

        if (!vinculoResponsavelAluno)
            throw new InvalidOperationException("Esse aluno não está vinculado ao responsável autenticado.");

        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.AlunoId == alunoId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado.");

        var vinculoTurma = await _context.TurmasAluno
            .Include(x => x.Turma)
            .Where(x => x.AlunoId == aluno.AlunoId && x.Ativo)
            .OrderByDescending(x => x.DataEntrada)
            .FirstOrDefaultAsync();

        if (vinculoTurma is null)
            throw new InvalidOperationException("Aluno não está vinculado a nenhuma turma ativa.");

        var notas = await _context.Notas
            .Include(n => n.Disciplina)
            .Where(n => n.AlunoId == aluno.AlunoId && n.TurmaId == vinculoTurma.TurmaId)
            .ToListAsync();

        var frequencias = await _context.Frequencias
            .Where(f => f.AlunoId == aluno.AlunoId && f.TurmaId == vinculoTurma.TurmaId)
            .ToListAsync();

        var disciplinas = notas
            .GroupBy(n => new { n.DisciplinaId, n.Disciplina.Nome })
            .Select(g =>
            {
                decimal? ObterNota(string tipo) =>
                    g.FirstOrDefault(x => x.TipoAvaliacao == tipo)?.Valor;

                var p1 = ObterNota("P1");
                var p2 = ObterNota("P2");
                var t1 = ObterNota("T1");
                var t2 = ObterNota("T2");
                var rec = ObterNota("REC");

                var mediaFinal = SituacaoAcademicaHelper.CalcularMediaRegular(
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

                var frequenciasDisciplina = frequencias
                    .Where(f => f.DisciplinaId == g.Key.DisciplinaId)
                    .ToList();

                decimal? frequenciaMedia = frequenciasDisciplina.Count > 0
                    ? Math.Round(
                        (decimal)frequenciasDisciplina.Count(f => f.Presente) / frequenciasDisciplina.Count * 100,
                        2
                    )
                    : null;

                return new BoletimDisciplinaResponseDto
                {
                    DisciplinaId = g.Key.DisciplinaId,
                    DisciplinaNome = g.Key.Nome,
                    P1 = p1,
                    P2 = p2,
                    T1 = t1,
                    T2 = t2,
                    REC = rec,
                    MediaFinal = mediaFinal,
                    FrequenciaMedia = frequenciaMedia,
                    Situacao = situacao
                };
            })
            .OrderBy(x => x.DisciplinaNome)
            .ToList();

        return new BoletimAlunoResponseDto
        {
            AlunoId = aluno.AlunoId,
            NomeCompleto = aluno.NomeCompleto,
            Registro = aluno.Registro,
            TurmaId = vinculoTurma.TurmaId,
            TurmaNome = vinculoTurma.Turma.Nome,
            AnoLetivo = vinculoTurma.Turma.AnoLetivo,
            Disciplinas = disciplinas
        };
    }

    public async Task<List<FrequenciaAlunoResponseDto>> ObterFrequenciaAlunoAsync(
        int usuarioId,
        int alunoId,
        DateTime? dataInicio,
        DateTime? dataFim)
    {
        var responsavel = await _context.Responsaveis
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);

        if (responsavel is null)
            throw new KeyNotFoundException("Responsável não encontrado para o usuário autenticado.");

        var vinculoResponsavelAluno = await _context.ResponsaveisAlunos
            .AnyAsync(ra => ra.ResponsavelId == responsavel.ResponsavelId && ra.AlunoId == alunoId);

        if (!vinculoResponsavelAluno)
            throw new InvalidOperationException("Esse aluno não está vinculado ao responsável autenticado.");

        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.AlunoId == alunoId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado.");

        var query = _context.Frequencias
            .Include(f => f.Turma)
            .Include(f => f.Disciplina)
            .Include(f => f.RegistradoPorProfessor)
            .Where(f => f.AlunoId == alunoId)
            .AsQueryable();

        if (dataInicio.HasValue)
            query = query.Where(f => f.DataAula >= dataInicio.Value.Date);

        if (dataFim.HasValue)
            query = query.Where(f => f.DataAula <= dataFim.Value.Date);

        return await query
            .OrderByDescending(f => f.DataAula)
            .ThenBy(f => f.Disciplina.Nome)
            .Select(f => new FrequenciaAlunoResponseDto
            {
                FrequenciaId = f.FrequenciaId,
                TurmaId = f.TurmaId,
                TurmaNome = f.Turma.Nome,
                DisciplinaId = f.DisciplinaId,
                DisciplinaNome = f.Disciplina.Nome,
                DataAula = f.DataAula,
                Presente = f.Presente,
                Observacao = f.Observacao,
                ProfessorNome = f.RegistradoPorProfessor.NomeCompleto
            })
            .ToListAsync();
    }

    public async Task<List<OcorrenciaAlunoResponseDto>> ObterOcorrenciasAlunoAsync(int usuarioId, int alunoId)
    {
        var responsavel = await _context.Responsaveis
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);

        if (responsavel is null)
            throw new KeyNotFoundException("Responsável não encontrado para o usuário autenticado.");

        var vinculoResponsavelAluno = await _context.ResponsaveisAlunos
            .AnyAsync(ra => ra.ResponsavelId == responsavel.ResponsavelId && ra.AlunoId == alunoId);

        if (!vinculoResponsavelAluno)
            throw new InvalidOperationException("Esse aluno não está vinculado ao responsável autenticado.");

        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.AlunoId == alunoId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado.");

        return await _context.Ocorrencias
            .Include(o => o.Turma)
            .Include(o => o.Professor)
            .Where(o => o.AlunoId == alunoId)
            .OrderByDescending(o => o.DataOcorrencia)
            .Select(o => new OcorrenciaAlunoResponseDto
            {
                OcorrenciaId = o.OcorrenciaId,
                TurmaId = o.TurmaId,
                TurmaNome = o.Turma.Nome,
                ProfessorId = o.ProfessorId,
                ProfessorNome = o.Professor.NomeCompleto,
                DisciplinaNome = _context.TurmasProfessoresDisciplinas
                    .Where(tpd => tpd.TurmaId == o.TurmaId && tpd.ProfessorId == o.ProfessorId)
                    .Select(tpd => tpd.Disciplina.Nome)
                    .FirstOrDefault() ?? "-",
                Descricao = o.Descricao,
                DataOcorrencia = o.DataOcorrencia
            })
            .ToListAsync();
    }

    public async Task<List<AgendaAlunoResponseDto>> ObterAgendaAlunoAsync(int usuarioId, int alunoId)
    {
        var responsavel = await _context.Responsaveis
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);

        if (responsavel is null)
            throw new KeyNotFoundException("Responsável não encontrado para o usuário autenticado.");

        var vinculoResponsavelAluno = await _context.ResponsaveisAlunos
            .AnyAsync(ra => ra.ResponsavelId == responsavel.ResponsavelId && ra.AlunoId == alunoId);

        if (!vinculoResponsavelAluno)
            throw new InvalidOperationException("Esse aluno não está vinculado ao responsável autenticado.");

        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.AlunoId == alunoId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado.");

        var vinculoTurma = await _context.TurmasAluno
            .Include(x => x.Turma)
            .Where(x => x.AlunoId == alunoId && x.Ativo)
            .OrderByDescending(x => x.DataEntrada)
            .FirstOrDefaultAsync();

        if (vinculoTurma is null)
            throw new InvalidOperationException("Aluno não está vinculado a nenhuma turma ativa.");

        return await _context.EventosAgenda
            .Include(e => e.CriadoPorProfessor)
            .Where(e => e.TurmaId == vinculoTurma.TurmaId)
            .OrderBy(e => e.DataEvento)
            .Select(e => new AgendaAlunoResponseDto
            {
                AgendaEventoId = e.AgendaEventoId,
                TurmaId = e.TurmaId,
                TurmaNome = vinculoTurma.Turma.Nome,
                Titulo = e.Titulo,
                Descricao = e.Descricao,
                DataEvento = e.DataEvento,
                ProfessorNome = e.CriadoPorProfessor.NomeCompleto
            })
            .ToListAsync();
    }

    public async Task<List<MaterialAlunoResponseDto>> ObterMateriaisAlunoAsync(int usuarioId, int alunoId)
    {
        var responsavel = await _context.Responsaveis
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);

        if (responsavel is null)
            throw new KeyNotFoundException("Responsável não encontrado para o usuário autenticado.");

        var vinculoResponsavelAluno = await _context.ResponsaveisAlunos
            .AnyAsync(ra => ra.ResponsavelId == responsavel.ResponsavelId && ra.AlunoId == alunoId);

        if (!vinculoResponsavelAluno)
            throw new InvalidOperationException("Esse aluno não está vinculado ao responsável autenticado.");

        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.AlunoId == alunoId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado.");

        var vinculoTurma = await _context.TurmasAluno
            .Include(x => x.Turma)
            .Where(x => x.AlunoId == alunoId && x.Ativo)
            .OrderByDescending(x => x.DataEntrada)
            .FirstOrDefaultAsync();

        if (vinculoTurma is null)
            throw new InvalidOperationException("Aluno não está vinculado a nenhuma turma ativa.");

        return await _context.MateriaisApoio
            .Include(m => m.Professor)
            .Where(m => m.TurmaId == vinculoTurma.TurmaId)
            .OrderByDescending(m => m.DataPublicacao)
            .Select(m => new MaterialAlunoResponseDto
            {
                MaterialApoioId = m.MaterialApoioId,
                TurmaId = m.TurmaId,
                TurmaNome = vinculoTurma.Turma.Nome,
                Titulo = m.Titulo,
                Descricao = m.Descricao,
                ArquivoUrl = m.ArquivoUrl,
                DataPublicacao = m.DataPublicacao,
                ProfessorNome = m.Professor.NomeCompleto
            })
            .ToListAsync();
    }

    public async Task<FinanceiroResponsavelResponseDto> ObterMeuFinanceiroAsync(int usuarioId)
    {
        var responsavel = await _context.Responsaveis
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);

        if (responsavel is null)
            throw new KeyNotFoundException("Responsável não encontrado para o usuário autenticado.");

        var alunosVinculados = await _context.ResponsaveisAlunos
            .Include(ra => ra.Aluno)
            .Where(ra => ra.ResponsavelId == responsavel.ResponsavelId)
            .Select(ra => ra.Aluno)
            .ToListAsync();

        var alunosIds = alunosVinculados.Select(a => a.AlunoId).ToList();

        var mensalidades = await _context.Mensalidades
            .Where(m => m.ResponsavelId == responsavel.ResponsavelId && alunosIds.Contains(m.AlunoId))
            .OrderByDescending(m => m.Competencia)
            .ThenBy(m => m.DataVencimento)
            .ToListAsync();

        var alunosDict = alunosVinculados.ToDictionary(a => a.AlunoId, a => a);

        return new FinanceiroResponsavelResponseDto
        {
            ResponsavelId = responsavel.ResponsavelId,
            NomeResponsavel = responsavel.NomeCompleto,
            EmailContato = responsavel.EmailContato,
            Itens = mensalidades
                .Select(m => new FinanceiroResponsavelItemDto
                {
                    MensalidadeId = m.MensalidadeId,
                    AlunoId = m.AlunoId,
                    NomeAluno = alunosDict.TryGetValue(m.AlunoId, out var aluno) ? aluno.NomeCompleto : string.Empty,
                    RegistroAluno = alunosDict.TryGetValue(m.AlunoId, out var aluno2) ? aluno2.Registro : string.Empty,
                    Competencia = m.Competencia,
                    Valor = m.Valor,
                    StatusPagamento = m.StatusPagamento,
                    DataVencimento = m.DataVencimento,
                    DataPagamento = m.DataPagamento,
                    Observacao = m.Observacao
                })
                .ToList()
        };
    }

    public async Task<List<PublicacaoResponseDto>> ListarPublicacoesAsync()
    {
        return await _context.Publicacoes
            .Include(p => p.Administrador)
            .Where(p => p.Ativa)
            .OrderByDescending(p => p.DataPublicacao)
            .Select(p => new PublicacaoResponseDto
            {
                PublicacaoId = p.PublicacaoId,
                Titulo = p.Titulo,
                Mensagem = p.Mensagem,
                DataPublicacao = p.DataPublicacao,
                Ativa = p.Ativa,
                CriadoPorNome = p.Administrador.NomeCompleto
            })
            .ToListAsync();
    }

    public async Task<List<ResponsavelListItemDto>> ListarAsync()
    {
        var responsaveis = await _context.Responsaveis
            .Include(r => r.Usuario)
            .OrderBy(r => r.NomeCompleto)
            .ToListAsync();

        var responsavelIds = responsaveis.Select(r => r.ResponsavelId).ToList();

        var vinculos = await _context.ResponsaveisAlunos
            .Where(ra => responsavelIds.Contains(ra.ResponsavelId))
            .ToListAsync();

        return responsaveis
            .Select(r => new ResponsavelListItemDto
            {
                ResponsavelId = r.ResponsavelId,
                UsuarioId = r.UsuarioId,
                Registro = r.Registro,
                NomeCompleto = r.NomeCompleto,
                Telefone = r.Telefone,
                EmailContato = r.EmailContato,
                Ativo = r.Usuario.Ativo,
                QuantidadeAlunosVinculados = vinculos.Count(v => v.ResponsavelId == r.ResponsavelId)
            })
            .ToList();
    }

    public async Task<ResponsavelAdminResponseDto> ObterPorIdAsync(int id)
    {
        var responsavel = await _context.Responsaveis
            .Include(r => r.Usuario)
            .FirstOrDefaultAsync(r => r.ResponsavelId == id);

        if (responsavel is null)
            throw new KeyNotFoundException("Responsável não encontrado.");

        var vinculos = await _context.ResponsaveisAlunos
            .Include(ra => ra.Aluno)
            .Where(ra => ra.ResponsavelId == responsavel.ResponsavelId)
            .OrderByDescending(ra => ra.Principal)
            .ThenBy(ra => ra.Aluno.NomeCompleto)
            .ToListAsync();

        return new ResponsavelAdminResponseDto
        {
            ResponsavelId = responsavel.ResponsavelId,
            UsuarioId = responsavel.UsuarioId,
            Registro = responsavel.Registro,
            NomeCompleto = responsavel.NomeCompleto,
            Telefone = responsavel.Telefone,
            EmailContato = responsavel.EmailContato,
            Ativo = responsavel.Usuario.Ativo,
            Alunos = vinculos.Select(v => new ResponsavelAlunoResumoAdminDto
            {
                AlunoId = v.AlunoId,
                NomeCompleto = v.Aluno.NomeCompleto,
                Registro = v.Aluno.Registro,
                TipoResponsabilidade = v.TipoResponsabilidade,
                Principal = v.Principal
            }).ToList()
        };
    }

    public async Task<ResponsavelAdminResponseDto> AtualizarAsync(int id, ResponsavelUpdateDto request)
    {
        ValidarAtualizacao(request);

        var responsavel = await _context.Responsaveis
            .Include(r => r.Usuario)
            .FirstOrDefaultAsync(r => r.ResponsavelId == id);

        if (responsavel is null)
            throw new KeyNotFoundException("Responsável não encontrado.");

        var emailNormalizado = request.EmailContato.Trim().ToLower();

        var emailEmUso = await _context.Responsaveis
            .AnyAsync(r => r.EmailContato == emailNormalizado && r.ResponsavelId != responsavel.ResponsavelId);

        if (emailEmUso)
            throw new InvalidOperationException("Já existe outro responsável com o e-mail de contato informado.");

        responsavel.NomeCompleto = request.NomeCompleto.Trim();
        responsavel.Telefone = request.Telefone.Trim();
        responsavel.EmailContato = emailNormalizado;
        responsavel.Usuario.Ativo = request.Ativo;

        await _context.SaveChangesAsync();

        return await ObterPorIdAsync(id);
    }

    private static void ValidarAtualizacao(ResponsavelUpdateDto request)
    {
        if (string.IsNullOrWhiteSpace(request.NomeCompleto))
            throw new ArgumentException("Nome do responsável é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Telefone))
            throw new ArgumentException("Telefone do responsável é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.EmailContato))
            throw new ArgumentException("Email de contato do responsável é obrigatório.");
    }
}