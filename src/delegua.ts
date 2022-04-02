import * as fs from "fs";
import * as caminho from "path";
import * as readline from "readline";

import { Lexador } from "./lexador";
import { Parser } from "./avaliador-sintatico";
import { Resolvedor } from "./resolvedor";
import { Interpretador } from "./interpretador";
import tiposDeSimbolos from "./tiposDeSimbolos";

import { ExcecaoRetornar } from "./excecoes";
import { AvaliadorSintaticoInterface, InterpretadorInterface, LexadorInterface, SimboloInterface } from "./interfaces";
import { ResolvedorInterface } from "./interfaces/resolvedor-interface";
import { InterpretadorEguaClassico } from "./interpretador/dialetos/egua-classico";
import { ResolverEguaClassico } from "./resolvedor/dialetos/egua-classico";
import { ParserEguaClassico } from "./avaliador-sintatico/dialetos/egua-classico";
import { LexadorEguaClassico } from "./lexador/dialetos/egua-classico";

export class Delegua {
    nomeArquivo: any;
    teveErro: boolean;
    teveErroEmTempoDeExecucao: boolean;
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
                this.lexador = new LexadorEguaClassico(this);
                this.avaliadorSintatico = new ParserEguaClassico(this);
                this.resolvedor = new ResolverEguaClassico(this, this.interpretador);
                console.log('Usando dialeto: Égua');
                break;
            case 'eguac':
                this.interpretador = new Interpretador(this, process.cwd());
                this.lexador = new Lexador(this);
                this.avaliadorSintatico = new Parser(this);
                this.resolvedor = new Resolvedor(this, this.interpretador);
                console.log('Usando dialeto: ÉguaC');
                break;
            case 'eguap':
                this.interpretador = new Interpretador(this, process.cwd());
                this.lexador = new Lexador(this);
                this.avaliadorSintatico = new Parser(this);
                this.resolvedor = new Resolvedor(this, this.interpretador);
                console.log('Usando dialeto: ÉguaP');
                break;
            default:
                this.interpretador = new Interpretador(this, process.cwd());
                this.lexador = new Lexador(this);
                this.avaliadorSintatico = new Parser(this);
                this.resolvedor = new Resolvedor(this, this.interpretador);
                console.log('Usando dialeto: padrão');
                break;
        }
    }

    versao() {
        try {
            const manifesto = caminho.resolve('package.json');
            return JSON.parse(fs.readFileSync(manifesto, { encoding: 'utf8' })).version || '0.1';
        } catch (error: any) {
            return '0.1 (desenvolvimento)';
        }        
    }

    iniciarDelegua() {
        console.log(`Console da Linguagem Delégua v${this.versao()}`);
        console.log('Pressione Ctrl + C para sair');

        const leiaLinha = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "\ndelegua> "
        });

        leiaLinha.prompt();

        leiaLinha.on("line", linha => {
            this.teveErro = false;
            this.teveErroEmTempoDeExecucao = false;

            this.executar([linha]);
            leiaLinha.prompt();
        });
    }

    carregarArquivo(nomeArquivo: string) {
        this.nomeArquivo = caminho.basename(nomeArquivo);

        const dadosDoArquivo: Buffer = fs.readFileSync(nomeArquivo);
        const conteudoDoArquivo: string[] = dadosDoArquivo.toString().split('\n');
        this.executar(conteudoDoArquivo);

        if (this.teveErro) process.exit(65);
        if (this.teveErroEmTempoDeExecucao) process.exit(70);
    }

    executar(codigo: string[], nomeArquivo: string = "") {
        const simbolos = this.lexador.mapear(codigo);

        if (this.teveErro) return;

        const declaracoes = this.avaliadorSintatico.analisar(simbolos);

        if (this.teveErro) return;

        this.resolvedor.resolver(declaracoes);

        if (this.teveErro) return;

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

    erro(simbolo: SimboloInterface, mensagemDeErro: any) {
        if (simbolo.tipo === tiposDeSimbolos.EOF) {
            this.reportar(simbolo.linha, " no final", mensagemDeErro);
        } else {
            this.reportar(simbolo.linha, ` no '${simbolo.lexema}'`, mensagemDeErro);
        }
    }

    erroNoLexador(linha: any, caractere: any, mensagem: any) {
        this.reportar(linha, ` no '${caractere}'`, mensagem);
    }

    erroEmTempoDeExecucao(erro: any) {
        if (erro & erro.simbolo && erro.simbolo.linha) {
            if (this.nomeArquivo)
                console.error(
                    `Erro: [Arquivo: ${this.nomeArquivo}] [Linha: ${erro.simbolo.linha}] ${erro.mensagem}`
                );
            else console.error(`Erro: [Linha: ${erro.simbolo.linha}] ${erro.mensagem}`);
        } else if (!(erro instanceof ExcecaoRetornar)) { // TODO: Ao se livrar de ReturnException, remover isto.
            console.error(`Erro: ${erro.mensagem}`);
        }
        
        this.teveErroEmTempoDeExecucao = true;
    }
}
