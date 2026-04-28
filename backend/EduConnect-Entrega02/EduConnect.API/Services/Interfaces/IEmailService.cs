namespace EduConnect.Api.Services.Interfaces;

public interface IEmailService
{
    Task EnviarCredenciaisNovoCadastroAsync(
        string emailDestino,
        string nomeResponsavel,
        string nomeAluno,
        string registroAluno,
        string senhaAluno,
        string? registroResponsavel,
        string? senhaResponsavel,
        bool responsavelJaExistia);

    Task EnviarRecuperacaoSenhaAsync(
        string emailDestino,
        string nomeDestino,
        string token,
        DateTime expiraEm,
        string mensagemContexto);

    Task EnviarSenhaRedefinidaAsync(
        string emailDestino,
        string nomeDestino,
        string mensagemContexto);

    Task EnviarCredenciaisProfessorAsync(
        string emailDestino,
        string nomeProfessor,
        string registroProfessor,
        string senhaTemporaria);
}