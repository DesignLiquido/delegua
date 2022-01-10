import * as fs from "fs";
import * as caminho from "path";
import * as readline from "readline";

import { Lexer } from "./lexador";
import { Parser } from "./avaliador-sintatico";
import { Resolver } from "./resolvedor";
import { Interpretador } from "./interpretador";
import tiposDeSimbolos from "./tiposDeSimbolos";

import { ReturnException } from "./excecoes";
import { AvaliadorSintaticoInterface, InterpretadorInterface, LexadorInterface } from "./interfaces";
import { ResolvedorInterface } from "./interfaces/resolvedor-interface";
import { InterpretadorEguaClassico } from "./interpretador/dialetos/egua-classico";
import { ResolverEguaClassico } from "./resolvedor/dialetos/egua-classico";
import { ParserEguaClassico } from "./avaliador-sintatico/dialetos/egua-classico";
import { LexerEguaClassico } from "./lexador/dialetos/egua-classico";

export class Delegua {
    nomeArquivo: any;
    teveErro: any;
    teveErroEmTempoDeExecucao: any;
    dialeto: string;

    interpretador: InterpretadorInterface;
    lexador: LexadorInterface;
    avaliadorSintatico: AvaliadorSintaticoInterface;
    resolvedor: ResolvedorInterface;

    constructor(dialeto: string = 'delegua', nomeArquivo?: string) {
        this.nomeArquivo = nomeArquivo;

        this.teveErro = false;
        this.teveErroEmTempoDeExecucao = false;

        this.dialeto = dialeto;
        switch (this.dialeto) {
            case 'egua':
                this.interpretador = new InterpretadorEguaClassico(this, process.cwd());
                this.lexador = new LexerEguaClassico(this);
                this.avaliadorSintatico = new ParserEguaClassico(this);
                this.resolvedor = new ResolverEguaClassico(this, this.interpretador);
                console.log('Usando dialeto: Égua');
                break;
            case 'eguac':
                this.interpretador = new Interpretador(this, process.cwd());
                this.lexador = new Lexer(this);
                this.avaliadorSintatico = new Parser(this);
                this.resolvedor = new Resolver(this, this.interpretador);
                console.log('Usando dialeto: ÉguaC');
                break;
            case 'eguap':
                this.interpretador = new Interpretador(this, process.cwd());
                this.lexador = new Lexer(this);
                this.avaliadorSintatico = new Parser(this);
                this.resolvedor = new Resolver(this, this.interpretador);
                console.log('Usando dialeto: ÉguaP');
                break;
            default:
                this.interpretador = new Interpretador(this, process.cwd());
                this.lexador = new Lexer(this);
                this.avaliadorSintatico = new Parser(this);
                this.resolvedor = new Resolver(this, this.interpretador);
                console.log('Usando dialeto: padrão');
                break;
        }
    }

    versao() {
        return JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8' })).version || ''
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

            this.run(linha);
            leiaLinha.prompt();
        });
    }

    carregarArquivo(nomeArquivo: any) {
        this.nomeArquivo = caminho.basename(nomeArquivo);

        const dadosDoArquivo = fs.readFileSync(nomeArquivo).toString();
        this.run(dadosDoArquivo);

        if (this.teveErro) process.exit(65);
        if (this.teveErroEmTempoDeExecucao) process.exit(70);
    }

    run(codigo: any) {
        const simbolos = this.lexador.scan(codigo);

        if (this.teveErro === true) return;

        const declaracoes = this.avaliadorSintatico.analisar(simbolos);

        if (this.teveErro === true) return;

        this.resolvedor.resolver(declaracoes);

        if (this.teveErro === true) return;

        this.interpretador.interpretar(declaracoes);
    }

    reportar(linha: any, onde: any, mensagem: any) {
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
}
