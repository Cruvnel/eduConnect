using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Frequencia;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using EduConnect.Api.Entities;

namespace EduConnect.Api.Services;

public class FrequenciaService : IFrequenciaService
{
    private readonly AppDbContext _context;

    public FrequenciaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FrequenciaResponseDto>> RegistrarAsync(int turmaId, int usuarioId, RegistrarFrequenciaDto request)
    {
        if (request.Alunos is null || request.Alunos.Count == 0)
            throw new ArgumentException("É obrigatório informar os alunos da chamada.");

        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var turma = await _context.Turmas
            .FirstOrDefaultAsync(t => t.TurmaId == turmaId);

        if (turma is null)
            throw new KeyNotFoundException("Turma não encontrada.");

        var vinculoProfessorTurma = await _context.TurmasProfessoresDisciplinas
            .Include(x => x.Disciplina)
            .FirstOrDefaultAsync(x => x.TurmaId == turmaId && x.ProfessorId == professor.ProfessorId);

        if (vinculoProfessorTurma is null)
            throw new InvalidOperationException("Professor não está vinculado a essa turma.");

        var disciplinaId = vinculoProfessorTurma.DisciplinaId;
        var disciplinaNome = vinculoProfessorTurma.Disciplina.Nome;

        var alunosAtivosNaTurma = await _context.TurmasAluno
            .Include(x => x.Aluno)
            .Where(x => x.TurmaId == turmaId && x.Ativo)
            .ToListAsync();

        var alunosIdsNaTurma = alunosAtivosNaTurma
            .Select(x => x.AlunoId)
            .ToHashSet();

        foreach (var item in request.Alunos)
        {
            if (!alunosIdsNaTurma.Contains(item.AlunoId))
                throw new InvalidOperationException($"O aluno {item.AlunoId} não pertence à turma informada.");
        }

        var dataAula = request.DataAula.Date;

        var frequenciasCriadas = new List<Entities.Frequencia>();

        var faltasParaNotificar = new List<Entities.Frequencia>();

        foreach (var item in request.Alunos)
        {
            var frequenciaExistente = await _context.Frequencias
                .FirstOrDefaultAsync(f =>
                    f.TurmaId == turmaId &&
                    f.AlunoId == item.AlunoId &&
                    f.DisciplinaId == disciplinaId &&
                    f.DataAula == dataAula);

            if (frequenciaExistente is not null)
            {
                var estavaPresenteAntes = frequenciaExistente.Presente;

                frequenciaExistente.Presente = item.Presente;
                frequenciaExistente.Observacao = string.IsNullOrWhiteSpace(item.Observacao)
                    ? null
                    : item.Observacao.Trim();
                frequenciaExistente.DataRegistro = DateTime.UtcNow;

                frequenciasCriadas.Add(frequenciaExistente);

                if (estavaPresenteAntes && !item.Presente)
                {
                    faltasParaNotificar.Add(frequenciaExistente);
                }
            }
            else
            {
                var novaFrequencia = new Entities.Frequencia
                {
                    TurmaId = turmaId,
                    AlunoId = item.AlunoId,
                    DisciplinaId = disciplinaId,
                    RegistradoPorProfessorId = professor.ProfessorId,
                    DataAula = dataAula,
                    Presente = item.Presente,
                    Observacao = string.IsNullOrWhiteSpace(item.Observacao)
                        ? null
                        : item.Observacao.Trim(),
                    DataRegistro = DateTime.UtcNow
                };

                _context.Frequencias.Add(novaFrequencia);
                frequenciasCriadas.Add(novaFrequencia);

                if (!item.Presente)
                {
                    faltasParaNotificar.Add(novaFrequencia);
                }
            }
        }

        await _context.SaveChangesAsync();

        var alunosDaResposta = await _context.Alunos
            .Where(a => request.Alunos.Select(x => x.AlunoId).Contains(a.AlunoId))
            .ToDictionaryAsync(a => a.AlunoId, a => a.NomeCompleto);

        foreach (var falta in faltasParaNotificar)
        {
            var aluno = alunosAtivosNaTurma
                .FirstOrDefault(x => x.AlunoId == falta.AlunoId)
                ?.Aluno;

            if (aluno is null)
                continue;

            var responsaveisUsuarioIds = await _context.ResponsaveisAlunos
                .Include(ra => ra.Responsavel)
                .Where(ra => ra.AlunoId == falta.AlunoId)
                .Select(ra => ra.Responsavel.UsuarioId)
                .ToListAsync();

            foreach (var responsavelUsuarioId in responsaveisUsuarioIds)
            {
                var notificacao = new Notificacao
                {
                    RemetenteUsuarioId = professor.UsuarioId,
                    DestinatarioUsuarioId = responsavelUsuarioId,
                    Tipo = "FALTA_REGISTRADA",
                    Titulo = "Falta registrada",
                    Mensagem = $"Foi registrada uma falta para {aluno.NomeCompleto} na disciplina {disciplinaNome}.",
                    DataEnvio = DateTime.UtcNow,
                    Lida = false,
                    DataLeitura = null,
                    EntidadeReferencia = "Frequencia",
                    EntidadeReferenciaId = falta.FrequenciaId
                };

                _context.Notificacoes.Add(notificacao);
            }
        }

        await _context.SaveChangesAsync();

        return frequenciasCriadas
            .Select(f => new FrequenciaResponseDto
            {
                FrequenciaId = f.FrequenciaId,
                TurmaId = turma.TurmaId,
                TurmaNome = turma.Nome,
                AlunoId = f.AlunoId,
                AlunoNome = alunosDaResposta.TryGetValue(f.AlunoId, out var nomeAluno) ? nomeAluno : string.Empty,
                DisciplinaId = disciplinaId,
                DisciplinaNome = disciplinaNome,
                RegistradoPorProfessorId = professor.ProfessorId,
                DataAula = f.DataAula,
                Presente = f.Presente,
                Observacao = f.Observacao,
                DataRegistro = f.DataRegistro
            })
            .OrderBy(x => x.AlunoNome)
            .ToList();
    }

    public async Task<List<FrequenciaResponseDto>> ListarPorTurmaEDataAsync(int turmaId, int usuarioId, DateTime dataAula)
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

        var data = dataAula.Date;

        return await _context.Frequencias
            .Include(f => f.Aluno)
            .Where(f =>
                f.TurmaId == turmaId &&
                f.DisciplinaId == vinculoProfessorTurma.DisciplinaId &&
                f.RegistradoPorProfessorId == professor.ProfessorId &&
                f.DataAula == data)
            .OrderBy(f => f.Aluno.NomeCompleto)
            .Select(f => new FrequenciaResponseDto
            {
                FrequenciaId = f.FrequenciaId,
                TurmaId = f.TurmaId,
                TurmaNome = vinculoProfessorTurma.Turma.Nome,
                AlunoId = f.AlunoId,
                AlunoNome = f.Aluno.NomeCompleto,
                DisciplinaId = f.DisciplinaId,
                DisciplinaNome = vinculoProfessorTurma.Disciplina.Nome,
                RegistradoPorProfessorId = f.RegistradoPorProfessorId,
                DataAula = f.DataAula,
                Presente = f.Presente,
                Observacao = f.Observacao,
                DataRegistro = f.DataRegistro
            })
            .ToListAsync();
    }
}