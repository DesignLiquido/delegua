const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
const Resolver = require("./resolver.js");
const Interpretador = require("./interpretador.js");
const tokenTypes = require("./tokenTypes.js");

module.exports.Delegua = class Delegua {
  constructor(nomeArquivo) {
    this.nomeArquivo = nomeArquivo;

    this.teveErro = false;
    this.teveErroEmTempoDeExecucao = false;
  }

  runBlock(codigo) {
    const interpretador = new Interpretador(this, process.cwd());

    const lexer = new Lexer(codigo, this);
    const simbolos = lexer.scan();

    if (this.teveErro === true) return;

    const analisar = new Parser(simbolos, this);
    const declaracoes = analisar.analisar();

    if (this.teveErro === true) return;

    const resolver = new Resolver(interpretador, this);
    resolver.resolve(declaracoes);

    if (this.teveErro === true) return;

    interpretador.interpretar(declaracoes);
  }

  reportar(linha, onde, mensagem) {
    if (this.nomeArquivo)
        console.error(
            `[Arquivo: ${this.nomeArquivo}] [Linha: ${linha}] Erro${onde}: ${mensagem}`
        );
    else console.error(`[Linha: ${linha}] Erro${onde}: ${mensagem}`);
    this.teveErro = true;
  }

  erro(simbolo, mensagemDeErro) {
    if (simbolo.tipo === tokenTypes.EOF) {
        this.reportar(simbolo.line, " no final", mensagemDeErro);
    } else {
        this.reportar(simbolo.line, ` no '${simbolo.lexeme}'`, mensagemDeErro);
    }
  }

  lexerError(linha, caractere, mensagem) {
    this.reportar(linha, ` no '${caractere}'`, mensagem);
  }

  runtimeError(erro) {
    const linha = erro.simbolo.linha;
    if (erro.simbolo && linha) {
        if (this.nomeArquivo)
            console.error(
                `Erro: [Arquivo: ${this.nomeArquivo}] [Linha: ${erro.simbolo.linha}] ${erro.mensagem}`
            );
        else console.error(`Erro: [Linha: ${erro.simbolo.linha}] ${erro.mensagem}`);
    } else {
        console.error(`Erro: ${erro.mensagem}`);
    }
    this.teveErroEmTempoDeExecucao = true;
  }
};