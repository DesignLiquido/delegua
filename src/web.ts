import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Resolver } from "./resolver";
import { Interpretador } from "./interpretador";
import tiposDeSimbolos from "./tiposDeSimbolos";

export class Delegua {
  nomeArquivo: any;

  teveErro: any;
  teveErroEmTempoDeExecucao: any;

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
    resolver.resolver(declaracoes);

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
    if (simbolo.tipo === tiposDeSimbolos.EOF) {
        this.reportar(simbolo.line, " no final", mensagemDeErro);
    } else {
        this.reportar(simbolo.line, ` no '${simbolo.lexeme}'`, mensagemDeErro);
    }
  }

  lexerError(linha, caractere, mensagem) {
    this.reportar(linha, ` no '${caractere}'`, mensagem);
  }

  erroEmTempoDeExecucao(erro) {
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