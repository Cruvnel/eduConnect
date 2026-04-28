using System.Net;
using System.Net.Mail;
using EduConnect.Api.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace EduConnect.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task EnviarCredenciaisNovoCadastroAsync(
        string emailDestino,
        string nomeResponsavel,
        string nomeAluno,
        string registroAluno,
        string senhaAluno,
        string? registroResponsavel,
        string? senhaResponsavel,
        bool responsavelJaExistia)
    {
        var host = _configuration["Email:SmtpHost"];
        var port = int.Parse(_configuration["Email:SmtpPort"]!);
        var usuario = _configuration["Email:Usuario"];
        var senha = _configuration["Email:Senha"];
        var remetente = _configuration["Email:Remetente"];

        var assunto = "EduConnect - Credenciais de acesso";

        var corpo = MontarCorpoEmail(
            nomeResponsavel,
            nomeAluno,
            registroAluno,
            senhaAluno,
            registroResponsavel,
            senhaResponsavel,
            responsavelJaExistia);

        using var mensagem = new MailMessage();
        mensagem.From = new MailAddress(remetente!);
        mensagem.To.Add(emailDestino);
        mensagem.Subject = assunto;
        mensagem.Body = corpo;
        mensagem.IsBodyHtml = false;

        using var smtp = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(usuario, senha),
            EnableSsl = true
        };

        await smtp.SendMailAsync(mensagem);
    }

    private static string MontarCorpoEmail(
        string nomeResponsavel,
        string nomeAluno,
        string registroAluno,
        string senhaAluno,
        string? registroResponsavel,
        string? senhaResponsavel,
        bool responsavelJaExistia)
    {
        if (!responsavelJaExistia)
        {
            return
$@"Olá, {nomeResponsavel}!

Seu cadastro e o cadastro do aluno {nomeAluno} foram realizados com sucesso no EduConnect.

Credenciais do responsável:
Registro: {registroResponsavel}
Senha: {senhaResponsavel}

Credenciais do aluno:
Registro: {registroAluno}
Senha: {senhaAluno}

Recomendamos alterar as senhas após o primeiro acesso.

Atenciosamente,
Equipe EduConnect";
        }

        return
$@"Olá, {nomeResponsavel}!

Um novo aluno foi vinculado ao seu cadastro no EduConnect: {nomeAluno}.

Credenciais do aluno:
Registro: {registroAluno}
Senha: {senhaAluno}

Suas credenciais de responsável permanecem as mesmas já enviadas anteriormente.

Atenciosamente,
Equipe EduConnect";
    }

    public async Task EnviarRecuperacaoSenhaAsync(
    string emailDestino,
    string nomeDestino,
    string token,
    DateTime expiraEm,
    string mensagemContexto)
    {
        var host = _configuration["Email:SmtpHost"];
        var port = int.Parse(_configuration["Email:SmtpPort"]!);
        var usuario = _configuration["Email:Usuario"];
        var senha = _configuration["Email:Senha"];
        var remetente = _configuration["Email:Remetente"];

        var assunto = "EduConnect - Recuperação de senha";

        var corpo =
    $@"Olá, {nomeDestino}!

{mensagemContexto}

Token de recuperação:
{token}

Validade: {expiraEm:dd/MM/yyyy HH:mm} UTC

Após receber o token, utilize o endpoint de redefinição de senha para cadastrar uma nova senha.

Se você não solicitou essa alteração, ignore este e-mail.

Atenciosamente,
Equipe EduConnect";

        using var mensagem = new MailMessage();
        mensagem.From = new MailAddress(remetente!);
        mensagem.To.Add(emailDestino);
        mensagem.Subject = assunto;
        mensagem.Body = corpo;
        mensagem.IsBodyHtml = false;

        using var smtp = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(usuario, senha),
            EnableSsl = true
        };

        await smtp.SendMailAsync(mensagem);
    }

    public async Task EnviarSenhaRedefinidaAsync(
        string emailDestino,
        string nomeDestino,
        string mensagemContexto)
    {
        var host = _configuration["Email:SmtpHost"];
        var port = int.Parse(_configuration["Email:SmtpPort"]!);
        var usuario = _configuration["Email:Usuario"];
        var senha = _configuration["Email:Senha"];
        var remetente = _configuration["Email:Remetente"];

        var assunto = "EduConnect - Senha redefinida com sucesso";

        var corpo =
    $@"Olá, {nomeDestino}!

{mensagemContexto}

A senha foi redefinida com sucesso.

Se você não reconhece essa ação, entre em contato com a administração.

Atenciosamente,
Equipe EduConnect";

        using var mensagem = new MailMessage();
        mensagem.From = new MailAddress(remetente!);
        mensagem.To.Add(emailDestino);
        mensagem.Subject = assunto;
        mensagem.Body = corpo;
        mensagem.IsBodyHtml = false;

        using var smtp = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(usuario, senha),
            EnableSsl = true
        };

        await smtp.SendMailAsync(mensagem);
    }

    public async Task EnviarCredenciaisProfessorAsync(
    string emailDestino,
    string nomeProfessor,
    string registroProfessor,
    string senhaTemporaria)
    {
        var host = _configuration["Email:SmtpHost"];
        var port = int.Parse(_configuration["Email:SmtpPort"]!);
        var usuario = _configuration["Email:Usuario"];
        var senha = _configuration["Email:Senha"];
        var remetente = _configuration["Email:Remetente"];

        var assunto = "EduConnect - Credenciais de acesso do professor";

        var corpo =
    $@"Olá, {nomeProfessor}!

Seu cadastro como professor no EduConnect foi realizado com sucesso.

Credenciais de acesso:
Registro: {registroProfessor}
Senha: {senhaTemporaria}

Recomendamos alterar sua senha após o primeiro acesso.

Atenciosamente,
Equipe EduConnect";

        using var mensagem = new MailMessage();
        mensagem.From = new MailAddress(remetente!);
        mensagem.To.Add(emailDestino);
        mensagem.Subject = assunto;
        mensagem.Body = corpo;
        mensagem.IsBodyHtml = false;

        using var smtp = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(usuario, senha),
            EnableSsl = true
        };

        await smtp.SendMailAsync(mensagem);
    }
}