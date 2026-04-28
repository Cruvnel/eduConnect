using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Aluno;
using EduConnect.Api.DTOs.Agenda;
using EduConnect.Api.DTOs.Material;
using EduConnect.Api.DTOs.Frequencia;
using EduConnect.Api.DTOs.Ocorrencia;
using EduConnect.Api.DTOs.Boletim;
using EduConnect.Api.Entities;
using EduConnect.Api.Helpers;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using EduConnect.Api.DTOs.Publicacao;

namespace EduConnect.Api.Services;

public class AlunoService : IAlunoService
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public AlunoService(AppDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    private async Task GerarMensalidadesAnoAsync(
        int responsavelId,
        int alunoId,
        decimal valorMensal,
        int ano)
    {
        if (valorMensal <= 0)
            return;

        var mensalidadesExistentes = await _context.Mensalidades
            .Where(m => m.AlunoId == alunoId && m.Competencia.StartsWith(ano.ToString()))
            .Select(m => m.Competencia)
            .ToListAsync();

        var novasMensalidades = new List<Mensalidade>();

        for (int mes = 1; mes <= 12; mes++)
        {
            var competencia = $"{ano}-{mes:D2}";

            // evita duplicidade
            if (mensalidadesExistentes.Contains(competencia))
                continue;

            novasMensalidades.Add(new Mensalidade
            {
                ResponsavelId = responsavelId,
                AlunoId = alunoId,
                Competencia = competencia,
                Valor = valorMensal,
                StatusPagamento = "Pendente",
                DataVencimento = new DateTime(ano, mes, 10),
                DataPagamento = null,
                Observacao = "Mensalidade gerada automaticamente no cadastro do aluno."
            });
        }

        if (novasMensalidades.Any())
            await _context.Mensalidades.AddRangeAsync(novasMensalidades);
    }
    public async Task<AlunoResponseDto> CriarAsync(AlunoCreateDto request)
    {
        Validar(request);

        var perfilAluno = await _context.Perfis.FirstOrDefaultAsync(p => p.Nome == "Aluno");
        if (perfilAluno is null)
            throw new InvalidOperationException("Perfil Aluno não encontrado.");

        var perfilResponsavel = await _context.Perfis.FirstOrDefaultAsync(p => p.Nome == "Responsavel");
        if (perfilResponsavel is null)
            throw new InvalidOperationException("Perfil Responsavel não encontrado.");

        var registroAlunoJaExiste = await _context.Usuarios
            .AnyAsync(u => u.Registro == request.RegistroAluno);

        if (registroAlunoJaExiste)
            throw new InvalidOperationException("Já existe um usuário com o registro do aluno informado.");

        var emailAluno = GerarEmailInstitucionalFake(request.RegistroAluno);

        var emailAlunoJaExiste = await _context.Usuarios
            .AnyAsync(u => u.Email == emailAluno);

        if (emailAlunoJaExiste)
            throw new InvalidOperationException("Já existe um usuário com o email institucional gerado para o aluno.");

        var senhaAlunoGerada = EduConnect.Api.Helpers.SenhaHelper.GerarSenhaAleatoria();

        string? registroResponsavelGerado = null;
        string? senhaResponsavelGerada = null;

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var responsavelExistente = await _context.Responsaveis
                .Include(r => r.Usuario)
                .FirstOrDefaultAsync(r => r.EmailContato == request.EmailContatoResponsavel.Trim().ToLower());

            Usuario usuarioResponsavel;
            Responsavel responsavel;
            var responsavelJaExistia = responsavelExistente is not null;

            if (responsavelExistente is null)
            {
                var proximoNumero = await _context.Usuarios
                    .CountAsync(u => u.PerfilId == perfilResponsavel.PerfilId) + 1;

                registroResponsavelGerado = $"RESP{proximoNumero:D4}";
                var emailResponsavel = GerarEmailInstitucionalFake(registroResponsavelGerado);

                while (await _context.Usuarios.AnyAsync(u =>
                           u.Registro == registroResponsavelGerado || u.Email == emailResponsavel))
                {
                    proximoNumero++;
                    registroResponsavelGerado = $"RESP{proximoNumero:D4}";
                    emailResponsavel = GerarEmailInstitucionalFake(registroResponsavelGerado);
                }

                senhaResponsavelGerada = EduConnect.Api.Helpers.SenhaHelper.GerarSenhaAleatoria();

                usuarioResponsavel = new Usuario
                {
                    PerfilId = perfilResponsavel.PerfilId,
                    Registro = registroResponsavelGerado,
                    Email = emailResponsavel,
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword(senhaResponsavelGerada),
                    Ativo = true,
                    DataCriacao = DateTime.UtcNow
                };

                _context.Usuarios.Add(usuarioResponsavel);
                await _context.SaveChangesAsync();

                responsavel = new Responsavel
                {
                    UsuarioId = usuarioResponsavel.UsuarioId,
                    Registro = registroResponsavelGerado,
                    NomeCompleto = request.NomeCompletoResponsavel.Trim(),
                    Telefone = request.TelefoneResponsavel.Trim(),
                    EmailContato = request.EmailContatoResponsavel.Trim().ToLower()
                };

                _context.Responsaveis.Add(responsavel);
                await _context.SaveChangesAsync();
            }
            else
            {
                responsavel = responsavelExistente;
                usuarioResponsavel = responsavelExistente.Usuario;
            }

            var usuarioAluno = new Usuario
            {
                PerfilId = perfilAluno.PerfilId,
                Registro = request.RegistroAluno.Trim(),
                Email = emailAluno,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(senhaAlunoGerada),
                Ativo = true,
                DataCriacao = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuarioAluno);
            await _context.SaveChangesAsync();

            var aluno = new Entities.Aluno
            {
                UsuarioId = usuarioAluno.UsuarioId,
                Registro = request.RegistroAluno.Trim(),
                NomeCompleto = request.NomeCompletoAluno.Trim(),
                DataNascimento = request.DataNascimentoAluno,
                FotoUrl = string.IsNullOrWhiteSpace(request.FotoUrl) ? null : request.FotoUrl.Trim(),
                ValorMensalPadrao = request.ValorMensalPadrao,
                Ativo = true
            };

            _context.Alunos.Add(aluno);
            await _context.SaveChangesAsync();

            var vinculoJaExiste = await _context.ResponsaveisAlunos
                .AnyAsync(x => x.ResponsavelId == responsavel.ResponsavelId && x.AlunoId == aluno.AlunoId);

            if (!vinculoJaExiste)
            {
                var responsavelAluno = new ResponsavelAluno
                {
                    ResponsavelId = responsavel.ResponsavelId,
                    AlunoId = aluno.AlunoId,
                    TipoResponsabilidade = string.IsNullOrWhiteSpace(request.TipoResponsabilidade)
                        ? null
                        : request.TipoResponsabilidade.Trim(),
                    Principal = request.ResponsavelPrincipal
                };

                _context.ResponsaveisAlunos.Add(responsavelAluno);
                await _context.SaveChangesAsync();
            }

            await GerarMensalidadesAnoAsync(
                responsavel.ResponsavelId,
                aluno.AlunoId,
                aluno.ValorMensalPadrao,
                DateTime.Now.Year
            );

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            await _emailService.EnviarCredenciaisNovoCadastroAsync(
                emailDestino: responsavel.EmailContato,
                nomeResponsavel: responsavel.NomeCompleto,
                nomeAluno: aluno.NomeCompleto,
                registroAluno: aluno.Registro,
                senhaAluno: senhaAlunoGerada,
                registroResponsavel: responsavelJaExistia ? null : registroResponsavelGerado,
                senhaResponsavel: responsavelJaExistia ? null : senhaResponsavelGerada,
                responsavelJaExistia: responsavelJaExistia
            );

            return new AlunoResponseDto
            {
                AlunoId = aluno.AlunoId,
                UsuarioAlunoId = usuarioAluno.UsuarioId,
                RegistroAluno = aluno.Registro,
                NomeCompletoAluno = aluno.NomeCompleto,
                DataNascimentoAluno = aluno.DataNascimento,
                FotoUrl = aluno.FotoUrl,
                ValorMensalPadrao = aluno.ValorMensalPadrao,
                EmailAluno = usuarioAluno.Email,

                ResponsavelId = responsavel.ResponsavelId,
                UsuarioResponsavelId = usuarioResponsavel.UsuarioId,
                RegistroResponsavel = responsavel.Registro,
                NomeCompletoResponsavel = responsavel.NomeCompleto,
                TelefoneResponsavel = responsavel.Telefone,
                EmailContatoResponsavel = responsavel.EmailContato,

                TipoResponsabilidade = request.TipoResponsabilidade,
                ResponsavelPrincipal = request.ResponsavelPrincipal,
                ResponsavelJaExistia = responsavelJaExistia
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<AlunoMeResponseDto> ObterMeuPerfilAsync(int usuarioId)
    {
        var aluno = await _context.Alunos
            .Include(a => a.Usuario)
            .FirstOrDefaultAsync(a => a.UsuarioId == usuarioId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado para o usuário autenticado.");

        var vinculoTurma = await _context.TurmasAluno
            .Include(x => x.Turma)
                .ThenInclude(t => t.NivelEnsino)
            .Where(x => x.AlunoId == aluno.AlunoId && x.Ativo)
            .OrderByDescending(x => x.DataEntrada)
            .FirstOrDefaultAsync();

        return new AlunoMeResponseDto
        {
            AlunoId = aluno.AlunoId,
            NomeCompleto = aluno.NomeCompleto,
            Registro = aluno.Registro,
            DataNascimento = aluno.DataNascimento,
            FotoUrl = aluno.FotoUrl,
            Email = aluno.Usuario.Email,

            TurmaId = vinculoTurma?.TurmaId,
            TurmaNome = vinculoTurma?.Turma?.Nome,
            AnoLetivo = vinculoTurma?.Turma?.AnoLetivo,
            Sala = vinculoTurma?.Turma?.Sala,
            ProfessorTutorNome = vinculoTurma?.Turma?.ProfessorTutorNome,
            NivelEnsino = vinculoTurma?.Turma?.NivelEnsino?.Nome
        };
    }

    public async Task<List<AgendaAlunoResponseDto>> ListarMinhaAgendaAsync(int usuarioId)
    {
        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.UsuarioId == usuarioId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado para o usuário autenticado.");

        var vinculoTurma = await _context.TurmasAluno
            .Include(x => x.Turma)
            .Where(x => x.AlunoId == aluno.AlunoId && x.Ativo)
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

    public async Task<List<MaterialAlunoResponseDto>> ListarMeusMateriaisAsync(int usuarioId)
    {
        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.UsuarioId == usuarioId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado para o usuário autenticado.");

        var vinculoTurma = await _context.TurmasAluno
            .Include(x => x.Turma)
            .Where(x => x.AlunoId == aluno.AlunoId && x.Ativo)
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
                DisciplinaNome = _context.TurmasProfessoresDisciplinas
                    .Where(tpd => tpd.TurmaId == m.TurmaId && tpd.ProfessorId == m.ProfessorId)
                    .Select(tpd => tpd.Disciplina.Nome)
                    .FirstOrDefault() ?? "-",
                Titulo = m.Titulo,
                Descricao = m.Descricao,
                ArquivoUrl = m.ArquivoUrl,
                DataPublicacao = m.DataPublicacao,
                ProfessorNome = m.Professor.NomeCompleto
            })
            .ToListAsync();
    }

    public async Task<List<FrequenciaAlunoResponseDto>> ListarMinhaFrequenciaAsync(
        int usuarioId,
        DateTime? dataInicio,
        DateTime? dataFim)
    {
        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.UsuarioId == usuarioId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado para o usuário autenticado.");

        var query = _context.Frequencias
            .Include(f => f.Turma)
            .Include(f => f.Disciplina)
            .Include(f => f.RegistradoPorProfessor)
            .Where(f => f.AlunoId == aluno.AlunoId)
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

    public async Task<List<OcorrenciaAlunoResponseDto>> ListarMinhasOcorrenciasAsync(int usuarioId)
    {
        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.UsuarioId == usuarioId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado para o usuário autenticado.");

        return await _context.Ocorrencias
            .Include(o => o.Turma)
            .Include(o => o.Professor)
            .Where(o => o.AlunoId == aluno.AlunoId)
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

    public async Task<BoletimAlunoResponseDto> ObterMeuBoletimAsync(int usuarioId)
    {
        var aluno = await _context.Alunos
            .Include(a => a.Usuario)
            .FirstOrDefaultAsync(a => a.UsuarioId == usuarioId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado para o usuário autenticado.");

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

                var mediaFinal = SituacaoAcademicaHelper.CalcularMediaRegular(p1, p2, t1, t2);

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
                        (decimal)frequenciasDisciplina.Count(f => f.Presente) /
                        frequenciasDisciplina.Count * 100,
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

    private static void Validar(AlunoCreateDto request)
    {
        if (string.IsNullOrWhiteSpace(request.RegistroAluno))
            throw new ArgumentException("Registro do aluno é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.NomeCompletoAluno))
            throw new ArgumentException("Nome do aluno é obrigatório.");

        if (request.ValorMensalPadrao < 0)
            throw new ArgumentException("Valor mensal do aluno não pode ser negativo.");

        if (string.IsNullOrWhiteSpace(request.NomeCompletoResponsavel))
            throw new ArgumentException("Nome do responsável é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.TelefoneResponsavel))
            throw new ArgumentException("Telefone do responsável é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.EmailContatoResponsavel))
            throw new ArgumentException("Email de contato do responsável é obrigatório.");
    }

    private static string GerarEmailInstitucionalFake(string registro)
    {
        return $"{registro.Trim().ToLower()}@educonnect.local";
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

    public async Task<List<AlunoListItemDto>> ListarAsync()
    {
        var alunos = await _context.Alunos
            .Include(a => a.Usuario)
            .OrderBy(a => a.NomeCompleto)
            .ToListAsync();

        var alunosIds = alunos.Select(a => a.AlunoId).ToList();

        var turmasAtivas = await _context.TurmasAluno
            .Include(ta => ta.Turma)
            .Where(ta => alunosIds.Contains(ta.AlunoId) && ta.Ativo)
            .ToListAsync();

        var vinculosResponsaveis = await _context.ResponsaveisAlunos
            .Include(ra => ra.Responsavel)
            .Where(ra => alunosIds.Contains(ra.AlunoId))
            .ToListAsync();

        return alunos.Select(aluno =>
        {
            var turmaAtiva = turmasAtivas
                .Where(t => t.AlunoId == aluno.AlunoId)
                .OrderByDescending(t => t.DataEntrada)
                .FirstOrDefault();

            var responsavelPrincipal = vinculosResponsaveis
                .Where(v => v.AlunoId == aluno.AlunoId)
                .OrderByDescending(v => v.Principal)
                .FirstOrDefault();

            return new AlunoListItemDto
            {
                AlunoId = aluno.AlunoId,
                UsuarioAlunoId = aluno.UsuarioId,
                RegistroAluno = aluno.Registro,
                NomeCompletoAluno = aluno.NomeCompleto,
                EmailAluno = aluno.Usuario.Email,
                Ativo = aluno.Ativo,

                TurmaId = turmaAtiva?.TurmaId,
                TurmaNome = turmaAtiva?.Turma?.Nome,

                ResponsavelId = responsavelPrincipal?.ResponsavelId,
                NomeCompletoResponsavel = responsavelPrincipal?.Responsavel?.NomeCompleto,
                EmailContatoResponsavel = responsavelPrincipal?.Responsavel?.EmailContato
            };
        }).ToList();
    }

    public async Task<AlunoResponseDto> ObterPorIdAsync(int id)
    {
        var aluno = await _context.Alunos
            .Include(a => a.Usuario)
            .FirstOrDefaultAsync(a => a.AlunoId == id);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado.");

        var vinculoResponsavel = await _context.ResponsaveisAlunos
            .Include(ra => ra.Responsavel)
                .ThenInclude(r => r.Usuario)
            .Where(ra => ra.AlunoId == aluno.AlunoId)
            .OrderByDescending(ra => ra.Principal)
            .FirstOrDefaultAsync();

        if (vinculoResponsavel is null)
            throw new KeyNotFoundException("Responsável do aluno não encontrado.");

        var responsavel = vinculoResponsavel.Responsavel;
        var usuarioResponsavel = responsavel.Usuario;

        return new AlunoResponseDto
        {
            AlunoId = aluno.AlunoId,
            UsuarioAlunoId = aluno.UsuarioId,
            RegistroAluno = aluno.Registro,
            NomeCompletoAluno = aluno.NomeCompleto,
            DataNascimentoAluno = aluno.DataNascimento,
            FotoUrl = aluno.FotoUrl,
            ValorMensalPadrao = aluno.ValorMensalPadrao,
            EmailAluno = aluno.Usuario.Email,

            ResponsavelId = responsavel.ResponsavelId,
            UsuarioResponsavelId = usuarioResponsavel.UsuarioId,
            RegistroResponsavel = responsavel.Registro,
            NomeCompletoResponsavel = responsavel.NomeCompleto,
            TelefoneResponsavel = responsavel.Telefone,
            EmailContatoResponsavel = responsavel.EmailContato,

            TipoResponsabilidade = vinculoResponsavel.TipoResponsabilidade,
            ResponsavelPrincipal = vinculoResponsavel.Principal,
            ResponsavelJaExistia = true
        };
    }

    public async Task<AlunoResponseDto> AtualizarAsync(int id, AlunoUpdateDto request)
    {
        ValidarAtualizacao(request);

        var aluno = await _context.Alunos
            .Include(a => a.Usuario)
            .FirstOrDefaultAsync(a => a.AlunoId == id);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado.");

        var vinculoResponsavel = await _context.ResponsaveisAlunos
            .Include(ra => ra.Responsavel)
                .ThenInclude(r => r.Usuario)
            .Where(ra => ra.AlunoId == aluno.AlunoId)
            .OrderByDescending(ra => ra.Principal)
            .FirstOrDefaultAsync();

        if (vinculoResponsavel is null)
            throw new KeyNotFoundException("Responsável principal do aluno não encontrado.");

        var responsavel = vinculoResponsavel.Responsavel;

        var emailContatoNormalizado = request.EmailContatoResponsavel.Trim().ToLower();

        var outroResponsavelComMesmoEmail = await _context.Responsaveis
            .AnyAsync(r => r.EmailContato == emailContatoNormalizado && r.ResponsavelId != responsavel.ResponsavelId);

        if (outroResponsavelComMesmoEmail)
            throw new InvalidOperationException("Já existe outro responsável com o e-mail de contato informado.");

        aluno.NomeCompleto = request.NomeCompletoAluno.Trim();
        aluno.DataNascimento = request.DataNascimentoAluno;
        aluno.FotoUrl = string.IsNullOrWhiteSpace(request.FotoUrl) ? null : request.FotoUrl.Trim();
        aluno.ValorMensalPadrao = request.ValorMensalPadrao;
        aluno.Ativo = request.Ativo;
        aluno.Usuario.Ativo = request.Ativo;

        responsavel.NomeCompleto = request.NomeCompletoResponsavel.Trim();
        responsavel.Telefone = request.TelefoneResponsavel.Trim();
        responsavel.EmailContato = emailContatoNormalizado;

        vinculoResponsavel.TipoResponsabilidade = string.IsNullOrWhiteSpace(request.TipoResponsabilidade)
            ? null
            : request.TipoResponsabilidade.Trim();
        vinculoResponsavel.Principal = request.ResponsavelPrincipal;

        await _context.SaveChangesAsync();

        return new AlunoResponseDto
        {
            AlunoId = aluno.AlunoId,
            UsuarioAlunoId = aluno.UsuarioId,
            RegistroAluno = aluno.Registro,
            NomeCompletoAluno = aluno.NomeCompleto,
            DataNascimentoAluno = aluno.DataNascimento,
            FotoUrl = aluno.FotoUrl,
            ValorMensalPadrao = aluno.ValorMensalPadrao,
            EmailAluno = aluno.Usuario.Email,

            ResponsavelId = responsavel.ResponsavelId,
            UsuarioResponsavelId = responsavel.UsuarioId,
            RegistroResponsavel = responsavel.Registro,
            NomeCompletoResponsavel = responsavel.NomeCompleto,
            TelefoneResponsavel = responsavel.Telefone,
            EmailContatoResponsavel = responsavel.EmailContato,

            TipoResponsabilidade = vinculoResponsavel.TipoResponsabilidade,
            ResponsavelPrincipal = vinculoResponsavel.Principal,
            ResponsavelJaExistia = true
        };
    }

    private static string GerarCompetencia(DateTime dataReferencia)
    {
        return $"{dataReferencia.Year}-{dataReferencia.Month:D2}";
    }

    private static DateTime GerarDataVencimento(DateTime dataReferencia)
    {
        return new DateTime(dataReferencia.Year, dataReferencia.Month, 10);
    }

    private async Task GerarMensalidadeInicialAsync(int responsavelId, int alunoId, decimal valorMensalPadrao)
    {
        if (valorMensalPadrao <= 0)
            return;

        var hoje = DateTime.UtcNow;
        var competenciaAtual = GerarCompetencia(hoje);

        var jaExiste = await _context.Mensalidades.AnyAsync(m =>
            m.AlunoId == alunoId &&
            m.Competencia == competenciaAtual);

        if (jaExiste)
            return;

        var mensalidade = new Mensalidade
        {
            ResponsavelId = responsavelId,
            AlunoId = alunoId,
            Competencia = competenciaAtual,
            Valor = valorMensalPadrao,
            StatusPagamento = "Pendente",
            DataVencimento = GerarDataVencimento(hoje),
            DataPagamento = null,
            Observacao = "Mensalidade gerada automaticamente no cadastro do aluno."
        };

        _context.Mensalidades.Add(mensalidade);
    }

    private async Task SincronizarMensalidadesPendentesAsync(int responsavelId, int alunoId, decimal novoValorMensal)
    {
        var hoje = DateTime.UtcNow;
        var competenciaAtual = GerarCompetencia(hoje);

        var mensalidadesPendentes = await _context.Mensalidades
            .Where(m =>
                m.AlunoId == alunoId &&
                m.ResponsavelId == responsavelId &&
                m.StatusPagamento != "Pago" &&
                string.Compare(m.Competencia, competenciaAtual) >= 0)
            .ToListAsync();

        foreach (var mensalidade in mensalidadesPendentes)
        {
            mensalidade.Valor = novoValorMensal;
        }

        var existeMensalidadeAtual = mensalidadesPendentes
            .Any(m => m.Competencia == competenciaAtual);

        if (!existeMensalidadeAtual && novoValorMensal > 0)
        {
            _context.Mensalidades.Add(new Mensalidade
            {
                ResponsavelId = responsavelId,
                AlunoId = alunoId,
                Competencia = competenciaAtual,
                Valor = novoValorMensal,
                StatusPagamento = "Pendente",
                DataVencimento = GerarDataVencimento(hoje),
                DataPagamento = null,
                Observacao = "Mensalidade gerada automaticamente após atualização do valor mensal do aluno."
            });
        }
    }
    private static void ValidarAtualizacao(AlunoUpdateDto request)
    {
        if (string.IsNullOrWhiteSpace(request.NomeCompletoAluno))
            throw new ArgumentException("Nome do aluno é obrigatório.");

        if (request.ValorMensalPadrao < 0)
            throw new ArgumentException("Valor mensal do aluno não pode ser negativo.");

        if (string.IsNullOrWhiteSpace(request.NomeCompletoResponsavel))
            throw new ArgumentException("Nome do responsável é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.TelefoneResponsavel))
            throw new ArgumentException("Telefone do responsável é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.EmailContatoResponsavel))
            throw new ArgumentException("Email de contato do responsável é obrigatório.");
    }
}