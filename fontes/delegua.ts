import * as fs from 'fs';
import * as caminho from 'path';
import * as readline from 'readline';
import chalk from 'chalk';

import { Lexador } from './lexador/lexador';
import { AvaliadorSintatico } from './avaliador-sintatico/avaliador-sintatico';
import { Resolvedor } from './resolvedor';
import { Interpretador } from './interpretador/interpretador';
import tiposDeSimbolos from './lexador/tipos-de-simbolos';

import { ExcecaoRetornar } from './excecoes';
import {
    AvaliadorSintaticoInterface,
    DeleguaInterface,
    InterpretadorComDepuracaoInterface,
    InterpretadorInterface,
    LexadorInterface,
    SimboloInterface,
} from './interfaces';
import { ResolvedorInterface } from './interfaces/resolvedor-interface';
import { InterpretadorEguaClassico } from './interpretador/dialetos/egua-classico';
import { LexadorEguaClassico } from './lexador/dialetos/lexador-egua-classico';
import { LexadorEguaP } from './lexador/dialetos/lexador-eguap';
import { AvaliadorSintaticoEguaP } from './avaliador-sintatico/dialetos/avaliador-sintatico-eguap';
import { ResolvedorEguaClassico } from './resolvedor/dialetos/egua-classico';
import { AvaliadorSintaticoEguaClassico } from './avaliador-sintatico/dialetos';
import { ServidorDepuracao } from './depuracao';

import { ImportadorInterface } from './interfaces/importador-interface';
import { Importador, RetornoImportador } from './importador';

export class Delegua implements DeleguaInterface {
    nomeArquivo: string;
    teveErro: boolean;
    teveErroEmTempoDeExecucao: boolean;
    dialeto: string;
    arquivosAbertos: { [identificador: string]: string };

    interpretador: InterpretadorInterface;
    lexador: LexadorInterface;
    avaliadorSintatico: AvaliadorSintaticoInterface;
    resolvedor: ResolvedorInterface;
    importador: ImportadorInterface;

    servidorDepuracao: ServidorDepuracao;

    constructor(
        dialeto: string = 'delegua',
        performance: boolean = false,
        nomeArquivo?: string,
        funcaoDeRetorno: Function = null
    ) {
        this.nomeArquivo = nomeArquivo;
        this.arquivosAbertos = {};

        this.teveErro = false;
        this.teveErroEmTempoDeExecucao = false;

        this.dialeto = dialeto;

        switch (this.dialeto) {
            case 'egua':
                this.resolvedor = new ResolvedorEguaClassico();
                this.lexador = new LexadorEguaClassico();
                this.avaliadorSintatico = new AvaliadorSintaticoEguaClassico();
                this.importador = new Importador(this.lexador, this.avaliadorSintatico, this.arquivosAbertos);
                this.interpretador = new InterpretadorEguaClassico(
                    this,
                    process.cwd()
                );
                
                console.log('Usando dialeto: Égua');
                break;
            case 'eguap':
                this.resolvedor = new Resolvedor();
                this.lexador = new LexadorEguaP();
                this.avaliadorSintatico = new AvaliadorSintaticoEguaP();
                this.importador = new Importador(this.lexador, this.avaliadorSintatico, this.arquivosAbertos);
                this.interpretador = new Interpretador(this.importador, this.resolvedor, process.cwd(), performance, null);

                console.log('Usando dialeto: ÉguaP');
                break;
            default:
                this.resolvedor = new Resolvedor();
                this.lexador = new Lexador(performance);
                this.avaliadorSintatico = new AvaliadorSintatico(performance);
                this.importador = new Importador(this.lexador, this.avaliadorSintatico, this.arquivosAbertos);
                this.interpretador = new Interpretador(
                    this.importador,
                    this.resolvedor,
                    process.cwd(),
                    performance,
                    funcaoDeRetorno
                );
                
                console.log('Usando dialeto: padrão');
                break;
        }
    }

    versao(): string {
        try {
            const manifesto = caminho.resolve('package.json');
            return (
                JSON.parse(fs.readFileSync(manifesto, { encoding: 'utf8' }))
                    .version || '0.2'
            );
        } catch (error: any) {
            return '0.2 (desenvolvimento)';
        }
    }

    /**
     * LAIR (Leia-Avalie-Imprima-Repita) é o modo em que Delégua executa em modo console, 
     * ou seja, esperando como entrada linhas de código fornecidas pelo usuário.
     */
    iniciarLairDelegua(): void {
        console.log(`Console da Linguagem Delégua v${this.versao()}`);
        console.log('Pressione Ctrl + C para sair');

        const leiaLinha = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '\ndelegua> ',
        });

        leiaLinha.prompt();

        leiaLinha.on('line', (linha) => {
            this.teveErro = false;
            this.teveErroEmTempoDeExecucao = false;

            const retornoLexador = this.lexador.mapear([linha], -1);
            const retornoAvaliadorSintatico = this.avaliadorSintatico.analisar(retornoLexador);
            this.executar({
                codigo: [linha],
                retornoLexador,
                retornoAvaliadorSintatico
            } as RetornoImportador);
            leiaLinha.prompt();
        });
    }

    iniciarDepuracao() {
        this.servidorDepuracao = new ServidorDepuracao(this);
        this.servidorDepuracao.iniciarServidorDepuracao();
    }

    finalizarDepuracao() {
        if (this.servidorDepuracao) {
            this.servidorDepuracao.finalizarServidorDepuracao();
        }
    }

    interpretadorSuportaDepuracao(interpretador: any): interpretador is InterpretadorComDepuracaoInterface {
        return 'interpretarParcial' in interpretador;
    }

    carregarArquivo(caminhoRelativoArquivo: string): void {
        this.nomeArquivo = caminho.basename(caminhoRelativoArquivo);

        const retornoImportador = this.importador.importar(caminhoRelativoArquivo);
        this.executar(retornoImportador);

        if (this.teveErro) process.exit(65);
        if (this.teveErroEmTempoDeExecucao) process.exit(70);
    }

    carregarArquivoComDepurador(caminhoRelativoArquivo: string): void {
        if (!this.interpretadorSuportaDepuracao(this.interpretador)) {
            throw new Error("Dialeto " + this.dialeto + " não suporta depuração.");
        }

        this.nomeArquivo = caminho.basename(caminhoRelativoArquivo);

        const retornoImportador = this.importador.importar(caminhoRelativoArquivo);
        if (retornoImportador.retornoLexador.erros.length > 0) {
            for (const erroLexador of retornoImportador.retornoLexador.erros) {
                this.reportar(erroLexador.linha, ` no '${erroLexador.caractere}'`, erroLexador.mensagem);
            }
            return;
        }

        if (retornoImportador.retornoAvaliadorSintatico.erros.length > 0) {
            for (const erroAvaliadorSintatico of retornoImportador.retornoAvaliadorSintatico.erros) {
                this.erro(erroAvaliadorSintatico.simbolo, erroAvaliadorSintatico.message);
            }
            return;
        }

        const retornoInterpretador = this.interpretador.interpretarParcial(retornoImportador.retornoAvaliadorSintatico.declaracoes);

        if (this.teveErro) process.exit(65);
        if (this.teveErroEmTempoDeExecucao) process.exit(70);
    }

    executar(retornoImportador: RetornoImportador) {
        if (retornoImportador.retornoLexador.erros.length > 0) {
            for (const erroLexador of retornoImportador.retornoLexador.erros) {
                this.reportar(erroLexador.linha, ` no '${erroLexador.caractere}'`, erroLexador.mensagem);
            }
            return;
        }

        if (retornoImportador.retornoAvaliadorSintatico.erros.length > 0) {
            for (const erroAvaliadorSintatico of retornoImportador.retornoAvaliadorSintatico.erros) {
                this.erro(erroAvaliadorSintatico.simbolo, erroAvaliadorSintatico.message);
            }
            return;
        }

        const retornoInterpretador = this.interpretador.interpretar(retornoImportador.retornoAvaliadorSintatico.declaracoes);

        if (retornoInterpretador.erros.length > 0) {
            for (const erroInterpretador of retornoInterpretador.erros) {
                if (erroInterpretador.simbolo) {
                    this.erroEmTempoDeExecucao(erroInterpretador.simbolo);
                } else {
                    const erroEmJavaScript: any = erroInterpretador as any;
                    console.error(chalk.red(`Erro em JavaScript: `) + `${erroEmJavaScript.message}`);
                    console.error(chalk.red(`Pilha de execução: `) + `${erroEmJavaScript.stack}`);
                }
            }
        }
    }

    reportar(linha: number, onde: any, mensagem: string): void {
        if (this.nomeArquivo)
            console.error(
                chalk.red(`[Arquivo: ${this.nomeArquivo}] [Linha: ${linha}]`) + ` Erro${onde}: ${mensagem}`
            );
        else console.error(chalk.red(`[Linha: ${linha}]`) +  ` Erro${onde}: ${mensagem}`);
        this.teveErro = true;
    }

    erro(simbolo: SimboloInterface, mensagemDeErro: string): void {
        if (simbolo.tipo === tiposDeSimbolos.EOF) {
            this.reportar(Number(simbolo.linha), ' no final', mensagemDeErro);
        } else {
            this.reportar(
                Number(simbolo.linha),
                ` no '${simbolo.lexema}'`,
                mensagemDeErro
            );
        }
    }

    erroEmTempoDeExecucao(erro: any): void {
        if (erro && erro.simbolo && erro.simbolo.linha) {
            if (this.nomeArquivo)
                console.error(
                    chalk.red(`Erro: [Arquivo: ${this.nomeArquivo}] [Linha: ${erro.simbolo.linha}]`) + ` ${erro.mensagem}`
                );
            else
                console.error(
                    chalk.red(`Erro: [Linha: ${erro.simbolo.linha}]`) + ` ${erro.mensagem}`
                );
        } else if (!(erro instanceof ExcecaoRetornar)) { // TODO: Se livrar de ExcecaoRetornar.
            console.error(chalk.red(`Erro: [Linha: ${erro.linha || 0}]`) + ` ${erro.mensagem}`);
        }

        this.teveErroEmTempoDeExecucao = true;
    }
}
