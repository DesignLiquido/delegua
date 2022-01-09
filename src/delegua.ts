import * as fs from "fs";
import * as caminho from "path";
import * as readline from "readline";

import { Lexer } from "./lexador";
import { Parser } from "./avaliador-sintatico";
import { Resolver } from "./resolvedor";
import { Interpretador } from "./interpretador";
import tiposDeSimbolos from "./tiposDeSimbolos";

import { ReturnException } from "./excecoes";

export class Delegua {
    nomeArquivo: any;
    teveErro: any;
    teveErroEmTempoDeExecucao: any;
    dialeto: string;

    constructor(nomeArquivo) {
        this.nomeArquivo = nomeArquivo;

        this.teveErro = false;
        this.teveErroEmTempoDeExecucao = false;
    }

    versao() {
        return JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8' })).version || ''
    }

    definirDialeto(dialeto){
        this.dialeto = dialeto || 'delegua';
    }

    dialetoEDelegua(){
        return this.dialeto === 'delegua'
    }

    iniciarDelegua() {
        const interpretador = new Interpretador(this, process.cwd());
        console.log(`Console da Linguagem Delégua v${this.versao()}`);
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

    carregarArquivo(nomeArquivo: any) {
        this.nomeArquivo = caminho.basename(nomeArquivo);
        const interpretador = new Interpretador(this, process.cwd());

        const dadosDoArquivo = fs.readFileSync(nomeArquivo).toString();
        this.run(dadosDoArquivo, interpretador);

        if (this.teveErro) process.exit(65);
        if (this.teveErroEmTempoDeExecucao) process.exit(70);
    }

    run(codigo: any, interpretador: any) {
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

    erro(simbolo: any, mensagemDeErro: any) {
        if (simbolo.tipo === tiposDeSimbolos.EOF) {
            this.reportar(simbolo.line, " no final", mensagemDeErro);
        } else {
            this.reportar(simbolo.line, ` no '${simbolo.lexema}'`, mensagemDeErro);
        }
    }

    lexerError(linha: any, caractere: any, mensagem: any) {
        this.reportar(linha, ` no '${caractere}'`, mensagem);
    }

    erroEmTempoDeExecucao(erro: any) {
        if (erro & erro.simbolo && erro.simbolo.linha) {
            if (this.nomeArquivo)
                console.error(
                    `Erro: [Arquivo: ${this.nomeArquivo}] [Linha: ${erro.simbolo.linha}] ${erro.mensagem}`
                );
            else console.error(`Erro: [Linha: ${erro.simbolo.linha}] ${erro.mensagem}`);
        } else if (!(erro instanceof ReturnException)) { // TODO: Ao se livrar de ReturnException, remover isto.
            console.error(`Erro: ${erro.mensagem}`);
        }
        
        this.teveErroEmTempoDeExecucao = true;
    }
};