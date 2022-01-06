const Lexer = require("./lexer.js");
const Parser = require("./parser.js");
const Resolver = require("./resolver.js");
const Interpretador = require("./interpretador.js");
const tiposDeSimbolos = require("./tiposDeSimbolos.js");
const fs = require("fs");
const caminho = require("path");
const readline = require("readline");

module.exports.Delegua = class Delegua {
    constructor(nomeArquivo) {
        this.nomeArquivo = nomeArquivo;

        this.teveErro = false;
        this.teveErroEmTempoDeExecucao = false;
    }

    runPrompt() {
        const interpretador = new Interpretador(this, process.cwd(), undefined);
        console.log("Console da Linguagem Delégua v0.0.1");
        const leiaLinha = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "\ndelegua> "
        });

        leiaLinha.prompt();

        leiaLinha.on("line", linha => {
            this.teveErro = false;
            this.teveErroEmTempoDeExecucao = false;

            this.run(linha, interpretador);
            leiaLinha.prompt();
        });
    }

    runfile(nomeArquivo) {
        this.nomeArquivo = caminho.basename(nomeArquivo);
        const interpretador = new Interpretador(this, process.cwd());

        const dadosDoArquivo = fs.readFileSync(nomeArquivo).toString();
        this.run(dadosDoArquivo, interpretador);

        if (this.teveErro) process.exit(65);
        if (this.teveErroEmTempoDeExecucao) process.exit(70);
    }

    run(codigo, interpretador) {
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