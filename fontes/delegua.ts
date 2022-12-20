import * as fs from 'fs';
import * as caminho from 'path';
import * as readline from 'readline';
import chalk from 'chalk';

import { Lexador } from './lexador/lexador';
import { AvaliadorSintatico } from './avaliador-sintatico/avaliador-sintatico';
import { Interpretador } from './interpretador/interpretador';
import tiposDeSimbolos from './tipos-de-simbolos/delegua';

import {
    AvaliadorSintaticoInterface,
    DeleguaInterface,
    InterpretadorComDepuracaoInterface,
    InterpretadorInterface,
    LexadorInterface,
    RetornoExecucaoInterface,
    SimboloInterface,
} from './interfaces';

import { InterpretadorEguaClassico } from './interpretador/dialetos/egua-classico';
import { LexadorEguaClassico } from './lexador/dialetos/lexador-egua-classico';
import { LexadorEguaP } from './lexador/dialetos/lexador-eguap';
import { AvaliadorSintaticoEguaP } from './avaliador-sintatico/dialetos/avaliador-sintatico-eguap';
import { AvaliadorSintaticoEguaClassico } from './avaliador-sintatico/dialetos';
import { ServidorDepuracao } from './depuracao';

import { ImportadorInterface } from './interfaces/importador-interface';
import { Importador, RetornoImportador } from './importador';
import { InterpretadorComDepuracao } from './interpretador/interpretador-com-depuracao';
import { ResolvedorEguaClassico } from './resolvedor/dialetos';
import { LexadorVisuAlg } from './lexador/dialetos/lexador-visualg';
import { AvaliadorSintaticoVisuAlg } from './avaliador-sintatico/dialetos/avaliador-sintatico-visualg';
import { LexadorBirl } from './lexador/dialetos/lexador-birl';
import { AvaliadorSintaticoBirl } from './avaliador-sintatico/dialetos/avaliador-sintatico-birl';
import { TradutorJavaScript } from './tradutores/tradutor-javascript';

/**
 * O núcleo da linguagem.
 *
 * Responsável por avaliar a entrada fornecida, entender o código e executá-lo.
 */
export class Delegua implements DeleguaInterface {
    dialeto: string;
    dialetos: { [identificador: string]: string} = {
        'birl': 'BIRL',
        'delegua': 'padrão',
        'egua': 'Égua',
        'eguap': 'ÉguaP',
        'visualg': 'VisuAlg'
    }

    arquivosAbertos: { [identificador: string]: string };
    conteudoArquivosAbertos: { [identificador: string]: string[] };

    interpretador: InterpretadorInterface;
    lexador: LexadorInterface;
    avaliadorSintatico: AvaliadorSintaticoInterface;
    importador: ImportadorInterface;
    tradutor: TradutorJavaScript;

    funcaoDeRetorno: Function;
    modoDepuracao: boolean;

    servidorDepuracao: ServidorDepuracao;

    constructor(dialeto = 'delegua', performance = false, depurador = false, traduzir = null, funcaoDeRetorno: Function = null) {
        this.arquivosAbertos = {};
        this.conteudoArquivosAbertos = {};

        this.dialeto = dialeto;
        this.funcaoDeRetorno = funcaoDeRetorno || console.log;
        this.modoDepuracao = depurador;

        switch (this.dialeto) {
            case 'egua':
                if (depurador) {
                    throw new Error('Dialeto ' + this.dialeto + ' não suporta depuração.');
                }

                this.lexador = new LexadorEguaClassico();
                this.avaliadorSintatico = new AvaliadorSintaticoEguaClassico();
                this.importador = new Importador(
                    this.lexador,
                    this.avaliadorSintatico,
                    this.arquivosAbertos,
                    this.conteudoArquivosAbertos,
                    depurador
                );
                this.interpretador = new InterpretadorEguaClassico(this, new ResolvedorEguaClassico(), process.cwd());
                break;
            case 'eguap':
                this.lexador = new LexadorEguaP();
                this.avaliadorSintatico = new AvaliadorSintaticoEguaP();
                this.importador = new Importador(
                    this.lexador,
                    this.avaliadorSintatico,
                    this.arquivosAbertos,
                    this.conteudoArquivosAbertos,
                    depurador
                );
                this.interpretador = depurador
                    ? new InterpretadorComDepuracao(this.importador, process.cwd(), funcaoDeRetorno)
                    : new Interpretador(this.importador, process.cwd(), performance, funcaoDeRetorno);
                break;
            case 'visualg':
                this.lexador = new LexadorVisuAlg();
                this.avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
                this.importador = new Importador(
                    this.lexador,
                    this.avaliadorSintatico,
                    this.arquivosAbertos,
                    this.conteudoArquivosAbertos,
                    depurador
                );
                this.interpretador = new Interpretador(this.importador, process.cwd(), false, console.log);
                break;
            case 'birl':
                this.lexador = new LexadorBirl();
                this.avaliadorSintatico = new AvaliadorSintaticoBirl();
                this.importador = new Importador(
                    this.lexador,
                    this.avaliadorSintatico,
                    this.arquivosAbertos,
                    this.conteudoArquivosAbertos,
                    depurador
                );
                this.interpretador = new Interpretador(this.importador, process.cwd(), false, console.log);
                break;
            default:
                this.lexador = new Lexador(performance);
                this.avaliadorSintatico = new AvaliadorSintatico(performance);
                this.importador = new Importador(
                    this.lexador,
                    this.avaliadorSintatico,
                    this.arquivosAbertos,
                    this.conteudoArquivosAbertos,
                    depurador
                );
                this.interpretador = depurador
                    ? new InterpretadorComDepuracao(this.importador, process.cwd(), funcaoDeRetorno)
                    : new Interpretador(this.importador, process.cwd(), performance, funcaoDeRetorno);
                break;
        }

        if (traduzir !== null && traduzir !== undefined) {
            this.tradutor = new TradutorJavaScript();
        }

        if (depurador) {
            this.iniciarDepuracao();
        }
    }

    versao(): string {
        try {
            const manifesto = caminho.resolve(__dirname, 'package.json');

            return JSON.parse(fs.readFileSync(manifesto, { encoding: 'utf8' })).version || '0.10';
        } catch (error: any) {
            return '0.10 (desenvolvimento)';
        }
    }

    /**
     * LAIR (Leia-Avalie-Imprima-Repita) é o modo em que Delégua executa em modo console,
     * ou seja, esperando como entrada linhas de código fornecidas pelo usuário.
     */
    iniciarLairDelegua(): void {
        this.funcaoDeRetorno(`Usando dialeto: ${this.dialetos[this.dialeto]}`);
        this.funcaoDeRetorno(`Console da Linguagem Delégua v${this.versao()}`);
        this.funcaoDeRetorno('Pressione Ctrl + C para sair');

        const interfaceLeitura = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '\ndelegua> ',
        });

        const isto = this;

        this.interpretador.interfaceEntradaSaida = interfaceLeitura;

        interfaceLeitura.prompt();
        interfaceLeitura.on('line', async (linha: string) => {
            const { resultado } = await isto.executarUmaLinha(linha);
            if (resultado.length) {
                isto.funcaoDeRetorno(resultado[0]);
            }

            interfaceLeitura.prompt();
        });
    }

    /**
     * Executa uma linha. Usado pelo modo LAIR e pelo servidor de depuração, quando recebe um comando 'avaliar'.
     * @param linha A linha a ser avaliada.
     * @returns O resultado da execução, com os retornos e respectivos erros, se houverem.
     */
    async executarUmaLinha(linha: string): Promise<RetornoExecucaoInterface> {
        const retornoLexador = this.lexador.mapear([linha], -1);
        const retornoAvaliadorSintatico = this.avaliadorSintatico.analisar(retornoLexador);
        if (
            this.afericaoErros({
                retornoLexador,
                retornoAvaliadorSintatico,
            } as RetornoImportador)
        ) {
            return { resultado: [] } as RetornoExecucaoInterface;
        }

        return await this.executar(
            {
                retornoLexador,
                retornoAvaliadorSintatico,
            } as RetornoImportador,
            true
        );
    }

    /**
     * Instancia um servidor de depuração, normalmente recebendo requisições na porta 7777.
     */
    iniciarDepuracao(): void {
        this.servidorDepuracao = new ServidorDepuracao(this);
        this.servidorDepuracao.iniciarServidorDepuracao();
        (this.interpretador as any).finalizacaoDaExecucao = this.finalizarDepuracao.bind(this);
    }

    /**
     * Pede ao servidor de depuração que finalize a execução.
     * Se não for feito, o servidor de depuração mantém um _stream_ aberto e nunca finaliza.
     * Mais informações: https://stackoverflow.com/a/47456805/1314276
     */
    finalizarDepuracao(): void {
        if (this.servidorDepuracao) {
            this.servidorDepuracao.finalizarServidorDepuracao();
        }
    }

    /**
     * Verifica erros nas etapas de lexação e avaliação sintática.
     * @param retornoImportador Um objeto que implementa a interface RetornoImportador.
     * @returns Verdadeiro se há erros. Falso caso contrário.
     */
    afericaoErros(retornoImportador: RetornoImportador): boolean {
        if (retornoImportador.retornoLexador.erros.length > 0) {
            for (const erroLexador of retornoImportador.retornoLexador.erros) {
                this.reportar(erroLexador.linha, ` no '${erroLexador.caractere}'`, erroLexador.mensagem);
            }
            return true;
        }

        if (retornoImportador.retornoAvaliadorSintatico.erros.length > 0) {
            for (const erroAvaliadorSintatico of retornoImportador.retornoAvaliadorSintatico.erros) {
                this.erro(erroAvaliadorSintatico.simbolo, erroAvaliadorSintatico.message);
            }
            return true;
        }

        return false;
    }

    traduzirArquivo(caminhoRelativoArquivo: string, gerarArquivoSaida: boolean): any {
        const caminhoAbsolutoPrimeiroArquivo = caminho.resolve(caminhoRelativoArquivo);
        const novoDiretorioBase = caminho.dirname(caminhoAbsolutoPrimeiroArquivo);

        this.importador.diretorioBase = novoDiretorioBase;

        const retornoImportador = this.importador.importar(caminhoRelativoArquivo, true);

        if (this.afericaoErros(retornoImportador)) {
            process.exit(65); // Código para erro de avaliação antes da tradução
        }

        const resultado = this.tradutor.traduzir(retornoImportador.retornoAvaliadorSintatico.declaracoes);

        if(gerarArquivoSaida){
            ['.delegua', '.egua'].map(extensao => {
                if(caminhoAbsolutoPrimeiroArquivo.includes(extensao)){
                    fs.writeFile(caminhoAbsolutoPrimeiroArquivo.replace(extensao, '.js'), resultado, (erro) => {
                        if (erro) throw erro;
                    })
                }
            })
        }

        this.funcaoDeRetorno(resultado);
    }

    /**
     * Execução por arquivo.
     * @param caminhoRelativoArquivo O caminho no sistema operacional do arquivo a ser aberto.
     */
    async carregarArquivo(caminhoRelativoArquivo: string): Promise<any> {
        const caminhoAbsolutoPrimeiroArquivo = caminho.resolve(caminhoRelativoArquivo);
        const novoDiretorioBase = caminho.dirname(caminhoAbsolutoPrimeiroArquivo);

        this.importador.diretorioBase = novoDiretorioBase;
        this.interpretador.diretorioBase = novoDiretorioBase;

        const retornoImportador = this.importador.importar(caminhoRelativoArquivo, true);

        if (this.afericaoErros(retornoImportador)) {
            process.exit(65); // Código para erro de avaliação antes da execução
        }

        let errosExecucao: any = {
            lexador: [],
            avaliadorSintatico: [],
            interpretador: [],
        };

        const interfaceLeitura = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '\n> ',
        });

        this.interpretador.interfaceEntradaSaida = interfaceLeitura;

        if (this.modoDepuracao) {
            (this.interpretador as InterpretadorComDepuracaoInterface).prepararParaDepuracao(
                retornoImportador.retornoAvaliadorSintatico.declaracoes
            );
        } else {
            const { erros } = await this.executar(retornoImportador);
            errosExecucao = erros;
        }

        interfaceLeitura.close();
        if (errosExecucao.length > 0) process.exit(70); // Código com exceções não tratadas
    }

    /**
     * A execução do código de fato.
     * @param retornoImportador Dados retornados do Importador, como o retorno do Lexador, do Avaliador
     *                          Sintático e respectivos erros.
     * @param manterAmbiente Indicação se ambiente deve ser mantido ou não. Normalmente verdadeiro
     *                       para LAIR, falso para execução por arquivo.
     * @returns Um objeto com o resultado da execução.
     */
    async executar(retornoImportador: RetornoImportador, manterAmbiente = false): Promise<RetornoExecucaoInterface> {
        const retornoInterpretador = await this.interpretador.interpretar(
            retornoImportador.retornoAvaliadorSintatico.declaracoes,
            manterAmbiente
        );

        if (retornoInterpretador.erros.length > 0) {
            for (const erroInterpretador of retornoInterpretador.erros) {
                if (erroInterpretador.simbolo) {
                    this.erroEmTempoDeExecucao(erroInterpretador);
                } else {
                    const erroEmJavaScript: any = erroInterpretador as any;
                    console.error(chalk.red(`Erro em JavaScript: `) + `${erroEmJavaScript.message}`);
                    console.error(chalk.red(`Pilha de execução: `) + `${erroEmJavaScript.stack}`);
                }
            }
        }

        return {
            erros: retornoInterpretador.erros,
            resultado: retornoInterpretador.resultado,
        };
    }

    reportar(linha: number, onde: any, mensagem: string): void {
        /* if (this.nomeArquivo)
            console.error(
                chalk.red(`[Arquivo: ${this.nomeArquivo}] [Linha: ${linha}]`) + ` Erro${onde}: ${mensagem}`
            );
        else */
        console.error(chalk.red(`[Linha: ${linha}]`) + ` Erro${onde}: ${mensagem}`);
    }

    erro(simbolo: SimboloInterface, mensagemDeErro: string): void {
        if (simbolo.tipo === tiposDeSimbolos.EOF) {
            this.reportar(Number(simbolo.linha), ' no final', mensagemDeErro);
        } else {
            this.reportar(Number(simbolo.linha), ` no '${simbolo.lexema}'`, mensagemDeErro);
        }
    }

    erroEmTempoDeExecucao(erro: any): void {
        if (erro && erro.simbolo && erro.simbolo.linha) {
            // TODO: Voltar isso após revisar pragmas de Interpretador.
            /* if (this.nomeArquivo)
                console.error(
                    chalk.red(`Erro: [Arquivo: ${this.nomeArquivo}] [Linha: ${erro.simbolo.linha}]`) + ` ${erro.mensagem}`
                );
            else */
            console.error(chalk.red(`Erro: [Linha: ${erro.simbolo.linha}]`) + ` ${erro.mensagem}`);
        } else {
            console.error(chalk.red(`Erro: [Linha: ${erro.linha || 0}]`) + ` ${erro.mensagem}`);
        }
    }
}
