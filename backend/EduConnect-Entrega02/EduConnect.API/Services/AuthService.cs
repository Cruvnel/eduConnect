using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Auth;
using EduConnect.Api.Services.Interfaces;
using EduConnect.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;

    public AuthService(AppDbContext context, ITokenService tokenService, IEmailService emailService)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var usuario = await _context.Usuarios
        .Include(u => u.Perfil)
        .Include(u => u.Administrador)
        .Include(u => u.Professor)
        .Include(u => u.Aluno)
        .Include(u => u.Responsavel)
        .FirstOrDefaultAsync(u => u.Registro == request.Registro);

        if (usuario is null)
            throw new UnauthorizedAccessException("Registro ou senha inválidos.");

        if (!usuario.Ativo)
            throw new UnauthorizedAccessException("Usuário inativo.");

        var senhaValida = BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash);

        if (!senhaValida)
            throw new UnauthorizedAccessException("Registro ou senha inválidos.");

        usuario.UltimoAcesso = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var perfil = usuario.Perfil.Nome;
        var nome = perfil switch
        {
            "Administrador" => usuario.Administrador?.NomeCompleto ?? "Administrador",
            "Professor" => usuario.Professor?.NomeCompleto ?? "Professor",
            "Aluno" => usuario.Aluno?.NomeCompleto ?? "Aluno",
            "Responsavel" => usuario.Responsavel?.NomeCompleto ?? "Responsável",
            _ => "Usuário"
        };

        var token = _tokenService.GerarToken(usuario, perfil, nome);

        return new LoginResponseDto
        {
            Token = token,
            ExpiraEm = DateTime.UtcNow.AddHours(8),
            UsuarioId = usuario.UsuarioId,
            Email = usuario.Email,
            Perfil = perfil,
            Nome = nome
        };
    }

    public async Task EsqueciSenhaAsync(EsqueciSenhaRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Identificador))
            throw new ArgumentException("Identificador é obrigatório.");

        var identificador = request.Identificador.Trim().ToLower();

        var usuario = await _context.Usuarios
            .Include(u => u.Perfil)
            .Include(u => u.Administrador)
            .Include(u => u.Professor)
            .Include(u => u.Aluno)
            .Include(u => u.Responsavel)
            .FirstOrDefaultAsync(u =>
                u.Email.ToLower() == identificador ||
                u.Registro.ToLower() == identificador);

        if (usuario is null)
            return;

        var token = Guid.NewGuid().ToString("N");
        var expiraEm = DateTime.UtcNow.AddHours(1);

        var tokenEntity = new RecuperacaoSenhaToken
        {
            UsuarioId = usuario.UsuarioId,
            Token = token,
            ExpiraEm = expiraEm,
            Usado = false,
            DataCriacao = DateTime.UtcNow
        };

        _context.RecuperacoesSenhaToken.Add(tokenEntity);
        await _context.SaveChangesAsync();

        string emailDestino;
        string nomeDestino;
        string mensagemContexto;

        var perfil = usuario.Perfil.Nome;

        if (perfil == "Aluno")
        {
            var aluno = await _context.Alunos
                .FirstOrDefaultAsync(a => a.UsuarioId == usuario.UsuarioId);

            if (aluno is null)
                return;

            var responsavelPrincipal = await _context.ResponsaveisAlunos
                .Include(ra => ra.Responsavel)
                .Where(ra => ra.AlunoId == aluno.AlunoId && ra.Principal)
                .Select(ra => ra.Responsavel)
                .FirstOrDefaultAsync();

            if (responsavelPrincipal is null)
                throw new InvalidOperationException("Aluno não possui responsável principal vinculado.");

            emailDestino = responsavelPrincipal.EmailContato;
            nomeDestino = responsavelPrincipal.NomeCompleto;
            mensagemContexto = $"Foi solicitada a redefinição de senha do aluno {aluno.NomeCompleto} (registro {aluno.Registro}) vinculado ao seu cadastro no EduConnect.";
        }
        else if (perfil == "Responsavel")
        {
            emailDestino = usuario.Responsavel?.EmailContato ?? usuario.Email;
            nomeDestino = usuario.Responsavel?.NomeCompleto ?? "Responsável";
            mensagemContexto = "Recebemos uma solicitação de redefinição de senha para a sua conta no EduConnect.";
        }
        else if (perfil == "Professor")
        {
            emailDestino = usuario.Email;
            nomeDestino = usuario.Professor?.NomeCompleto ?? "Professor";
            mensagemContexto = "Recebemos uma solicitação de redefinição de senha para a sua conta no EduConnect.";
        }
        else
        {
            emailDestino = usuario.Email;
            nomeDestino = usuario.Administrador?.NomeCompleto ?? "Administrador";
            mensagemContexto = "Recebemos uma solicitação de redefinição de senha para a sua conta no EduConnect.";
        }

        await _emailService.EnviarRecuperacaoSenhaAsync(
            emailDestino: emailDestino,
            nomeDestino: nomeDestino,
            token: token,
            expiraEm: expiraEm,
            mensagemContexto: mensagemContexto
        );
    }

    public async Task RedefinirSenhaAsync(RedefinirSenhaRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
            throw new ArgumentException("Token é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.NovaSenha))
            throw new ArgumentException("Nova senha é obrigatória.");

        var tokenEntity = await _context.RecuperacoesSenhaToken
            .Include(t => t.Usuario)
                .ThenInclude(u => u.Perfil)
            .Include(t => t.Usuario.Administrador)
            .Include(t => t.Usuario.Professor)
            .Include(t => t.Usuario.Aluno)
            .Include(t => t.Usuario.Responsavel)
            .FirstOrDefaultAsync(t => t.Token == request.Token);

        if (tokenEntity is null)
            throw new InvalidOperationException("Token inválido.");

        if (tokenEntity.Usado)
            throw new InvalidOperationException("Token já utilizado.");

        if (tokenEntity.ExpiraEm < DateTime.UtcNow)
            throw new InvalidOperationException("Token expirado.");

        tokenEntity.Usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha);
        tokenEntity.Usado = true;

        await _context.SaveChangesAsync();

        var usuario = tokenEntity.Usuario;
        var perfil = usuario.Perfil.Nome;

        string emailDestino;
        string nomeDestino;
        string mensagemContexto;

        if (perfil == "Aluno")
        {
            var aluno = await _context.Alunos
                .FirstOrDefaultAsync(a => a.UsuarioId == usuario.UsuarioId);

            if (aluno is null)
                return;

            var responsavelPrincipal = await _context.ResponsaveisAlunos
                .Include(ra => ra.Responsavel)
                .Where(ra => ra.AlunoId == aluno.AlunoId && ra.Principal)
                .Select(ra => ra.Responsavel)
                .FirstOrDefaultAsync();

            if (responsavelPrincipal is null)
                throw new InvalidOperationException("Aluno não possui responsável principal vinculado.");

            emailDestino = responsavelPrincipal.EmailContato;
            nomeDestino = responsavelPrincipal.NomeCompleto;
            mensagemContexto = $"A senha do aluno {aluno.NomeCompleto} (registro {aluno.Registro}) foi redefinida com sucesso.";
        }
        else if (perfil == "Responsavel")
        {
            emailDestino = usuario.Responsavel?.EmailContato ?? usuario.Email;
            nomeDestino = usuario.Responsavel?.NomeCompleto ?? "Responsável";
            mensagemContexto = "A senha da sua conta foi redefinida.";
        }
        else if (perfil == "Professor")
        {
            emailDestino = usuario.Email;
            nomeDestino = usuario.Professor?.NomeCompleto ?? "Professor";
            mensagemContexto = "A senha da sua conta foi redefinida.";
        }
        else
        {
            emailDestino = usuario.Email;
            nomeDestino = usuario.Administrador?.NomeCompleto ?? "Administrador";
            mensagemContexto = "A senha da sua conta foi redefinida.";
        }

        await _emailService.EnviarSenhaRedefinidaAsync(
            emailDestino: emailDestino,
            nomeDestino: nomeDestino,
            mensagemContexto: mensagemContexto
        );
    }

    public async Task<AuthMeResponseDto?> ObterUsuarioAtualAsync(int usuarioId)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Perfil)
            .Include(u => u.Administrador)
            .Include(u => u.Professor)
            .Include(u => u.Aluno)
            .Include(u => u.Responsavel)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId);

        if (usuario is null)
            return null;

        var perfil = usuario.Perfil.Nome;

        var nome = perfil switch
        {
            "Administrador" => usuario.Administrador?.NomeCompleto ?? "Administrador",
            "Professor" => usuario.Professor?.NomeCompleto ?? "Professor",
            "Aluno" => usuario.Aluno?.NomeCompleto ?? "Aluno",
            "Responsavel" => usuario.Responsavel?.NomeCompleto ?? "Responsável",
            _ => "Usuário"
        };

        return new AuthMeResponseDto
        {
            UsuarioId = usuario.UsuarioId,
            Nome = nome,
            Email = usuario.Email,
            Perfil = perfil,
            Registro = usuario.Registro
        };
    }
}
