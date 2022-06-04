import { Ambiente } from "../ambiente";
import { Declaracao } from "../declaracoes";
import { PontoParada } from "../depuracao";
import { ImportadorInterface, ResolvedorInterface } from "../interfaces";
import { EscopoExecucao } from "../interfaces/escopo-execucao";
import { Quebra } from "../quebras";
import { Interpretador } from "./interpretador";
import { RetornoInterpretador } from "./retorno-interpretador";

export class InterpretadorComDepuracao extends Interpretador {
    pontosParada: PontoParada[];
    declaracaoAtual: number;
    finalizacaoDaExecucao: Function;

    constructor(
        importador: ImportadorInterface,
        resolvedor: ResolvedorInterface,
        diretorioBase: string,
        funcaoDeRetorno: Function
    ) {
        super(importador, resolvedor, diretorioBase, false, funcaoDeRetorno);

        this.pontosParada = [];
        this.declaracaoAtual = 0;
    }

    /**
     * Para fins de depuração, verifica se há ponto de parada no mesmo pragma da declaração.
     * @param declaracao A declaração a ser executada.
     * @returns True quando execução deve parar. False caso contrário.
     */
     verificarPontoParada(declaracao: Declaracao): boolean {
        const buscaPontoParada: PontoParada[] = this.pontosParada.filter(
            (p) =>
                p.hashArquivo === declaracao.hashArquivo &&
                p.linha === declaracao.linha
        );

        if (buscaPontoParada.length > 0) {
            console.log('Ponto de parada encontrado.');
            return true;
        }

        return false;
    }

    /**
     * Continua a interpretação parcial do último ponto em que parou. 
     * Pode ser tanto o começo da execução inteira, ou pós comando do depurador
     * quando há um ponto de parada.
     * @param naoVerificarPrimeiraExecucao Booleano que pede ao Interpretador para não
     *                                     verificar o ponto de parada na primeira execução. 
     *                                     Normalmente usado pelo Servidor de Depuração para continuar uma linha. 
     * @returns Um objeto de retorno, com erros encontrados se houverem.
     */
     executarUltimoEscopo(manterAmbiente: boolean = false, naoVerificarPrimeiraExecucao: boolean = false): RetornoInterpretador {
        const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        try {
            let retornoExecucao: any;
            for (; !(retornoExecucao instanceof Quebra) && ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length; ultimoEscopo.declaracaoAtual++) {
                if (naoVerificarPrimeiraExecucao) {
                    naoVerificarPrimeiraExecucao = false;
                } else if (this.verificarPontoParada(ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual])) {
                    break;
                }
                retornoExecucao = this.executar(ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]);
            }
        } catch (erro: any) {
            this.erros.push(erro);
        } finally {
            this.pilhaEscoposExecucao.removerUltimo();
            if (manterAmbiente) {
                const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();
                escopoAnterior.ambiente.valores = Object.assign(escopoAnterior.ambiente.valores, 
                    ultimoEscopo.ambiente.valores);
            }

            if (this.pilhaEscoposExecucao.elementos() === 1) {
                this.finalizacaoDaExecucao();
            }

            return {
                erros: this.erros,
            } as RetornoInterpretador;
        }
    }

    /**
     * Interpretação utilizada pelo depurador. Pode encerrar ao encontrar um
     * ponto de parada ou não.
     * Diferentemente da interpretação tradicional, não possui indicadores
     * de performance porque eles não fazem sentido aqui.
     * @param declaracoes Um vetor de declarações.
     * @returns Um objeto de retorno, com erros encontrados se houverem.
     */
    interpretar(declaracoes: Declaracao[], manterAmbiente: boolean = false): RetornoInterpretador {
        this.erros = [];
        this.declaracoes = declaracoes;

        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: new Ambiente()
        }
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        return this.executarUltimoEscopo(manterAmbiente);
    }
}