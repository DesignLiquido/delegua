import * as fs from 'fs';
import * as caminho from 'path';
import * as readline from 'readline';
import chalk from 'chalk';

import { Lexador } from './lexador/lexador';
import { AvaliadorSintatico } from './avaliador-sintatico/avaliador-sintatico';
import { Resolvedor } from './resolvedor';
import { Interpretador } from './interpretador';
import tiposDeSimbolos from './lexador/tipos-de-simbolos';

import { ExcecaoRetornar } from './excecoes';
import {
    AvaliadorSintaticoInterface,
    DeleguaInterface,
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

    constructor(
        dialeto: string = 'delegua',
        performance: boolean = false,
        nomeArquivo?: string
    ) {
        this.nomeArquivo = nomeArquivo;

        this.teveErro = false;
        this.teveErroEmTempoDeExecucao = false;

        this.dialeto = dialeto;
        switch (this.dialeto) {
            case 'egua':
                this.interpretador = new InterpretadorEguaClassico(
                    this,
                    process.cwd()
                );
                this.lexador = new LexadorEguaClassico();
                this.avaliadorSintatico = new AvaliadorSintaticoEguaClassico();
                this.resolvedor = new ResolvedorEguaClassico();
                console.log('Usando dialeto: Égua');
                break;
            case 'eguap':
                this.interpretador = new Interpretador(this, process.cwd());
                this.lexador = new LexadorEguaP();
                this.avaliadorSintatico = new AvaliadorSintaticoEguaP();
                this.resolvedor = new Resolvedor();
                console.log('Usando dialeto: ÉguaP');
                break;
            default:
                this.interpretador = new Interpretador(
                    this,
                    process.cwd(),
                    performance
                );
                this.lexador = new Lexador(performance);
                this.avaliadorSintatico = new AvaliadorSintatico(performance);
                this.resolvedor = new Resolvedor();
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

    iniciarDelegua(): void {
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

            this.executar([linha]);
            leiaLinha.prompt();
        });
    }

    carregarArquivo(caminhoRelativoArquivo: string): void {
        this.nomeArquivo = caminho.basename(caminhoRelativoArquivo);

        const dadosDoArquivo: Buffer = fs.readFileSync(caminhoRelativoArquivo);
        const conteudoDoArquivo: string[] = dadosDoArquivo
            .toString()
            .split('\n');
        this.executar(conteudoDoArquivo);

        if (this.teveErro) process.exit(65);
        if (this.teveErroEmTempoDeExecucao) process.exit(70);
    }

    executar(codigo: string[], nomeArquivo: string = '') {
        const retornoLexador = this.lexador.mapear(codigo);

        if (retornoLexador.erros.length > 0) {
            for (const erroLexador of retornoLexador.erros) {
                this.reportar(erroLexador.linha, ` no '${erroLexador.caractere}'`, erroLexador.mensagem);
            }
            return;
        }

        const retornoAvaliadorSintatico = this.avaliadorSintatico.analisar(retornoLexador.simbolos);

        if (retornoAvaliadorSintatico.erros.length > 0) {
            for (const erroAvaliadorSintatico of retornoAvaliadorSintatico.erros) {
                this.erro(erroAvaliadorSintatico.simbolo, erroAvaliadorSintatico.message);
            }
            return;
        }

        const retornoResolvedor = this.resolvedor.resolver(retornoAvaliadorSintatico.declaracoes);

        if (retornoResolvedor.erros.length > 0) {
            for (const erroResolvedor of retornoResolvedor.erros) {
                this.erro(erroResolvedor.simbolo, erroResolvedor.message);
            }
            return;
        }

        const retornoInterpretador = this.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes, retornoResolvedor.locais);

        if (retornoInterpretador.erros.length > 0) {
            for (const erroInterpretador of retornoInterpretador.erros) {
                this.erroEmTempoDeExecucao(erroInterpretador.simbolo);
            }
        }
    }

    reportar(linha: number, onde: any, mensagem: string) {
        if (this.nomeArquivo)
            console.error(
                chalk.red(`[Arquivo: ${this.nomeArquivo}] [Linha: ${linha}]`) + ` Erro${onde}: ${mensagem}`
            );
        else console.error(chalk.red(`[Linha: ${linha}]`) +  ` Erro${onde}: ${mensagem}`);
        this.teveErro = true;
    }

    erro(simbolo: SimboloInterface, mensagemDeErro: string) {
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
        if (erro & erro.simbolo && erro.simbolo.linha) {
            if (this.nomeArquivo)
                console.error(
                    chalk.red(`Erro: [Arquivo: ${this.nomeArquivo}] [Linha: ${erro.simbolo.linha}]`) + ` ${erro.mensagem}`
                );
            else
                console.error(
                    chalk.red(`Erro: [Linha: ${erro.simbolo.linha}]`) + ` ${erro.mensagem}`
                );
        } else if (!(erro instanceof ExcecaoRetornar)) {
            // TODO: Ao se livrar de ReturnException, remover isto.
            console.error(chalk.red(`Erro: [Linha: ${erro.linha || 0}]`) + ` ${erro.mensagem}`);
        }

        this.teveErroEmTempoDeExecucao = true;
    }
}
