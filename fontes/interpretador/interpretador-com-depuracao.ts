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
    pontoDeParadaAtivo: boolean;
    escopoAtual: number;

    constructor(
        importador: ImportadorInterface,
        resolvedor: ResolvedorInterface,
        diretorioBase: string,
        funcaoDeRetorno: Function
    ) {
        super(importador, resolvedor, diretorioBase, false, funcaoDeRetorno);

        this.pontosParada = [];
        this.declaracaoAtual = 0;
        this.pontoDeParadaAtivo = false;
        this.escopoAtual = 0;
    }

    /**
     * Se bloco de execução já foi instanciado antes (por exemplo, quando há um ponto de parada e a
     * execução do código é retomada pelo depurador), retoma a execução do bloco do ponto em que havia parado.
     * Se bloco de execução ainda não foi instanciado, empilha declarações na pilha de escopos de execução, 
     * cria um novo ambiente e executa as declarações empilhadas.
     * @param declaracoes Um vetor de declaracoes a ser executado.
     * @param ambiente O ambiente de execução quando houver, como parâmetros, argumentos, etc.
     */
    executarBloco(declaracoes: Declaracao[], ambiente?: Ambiente): any {
        if (this.escopoAtual < this.pilhaEscoposExecucao.elementos() - 1) {
            this.escopoAtual++;
            const proximoEscopo = this.pilhaEscoposExecucao.naPosicao(this.escopoAtual);
            let retornoExecucao: any;

            // Sempre executa a próxima instrução, mesmo que haja ponto de parada.
            retornoExecucao = this.executar(proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]);
            proximoEscopo.declaracaoAtual++
            for (; !(retornoExecucao instanceof Quebra) && proximoEscopo.declaracaoAtual < proximoEscopo.declaracoes.length; proximoEscopo.declaracaoAtual++) {
                this.pontoDeParadaAtivo = this.verificarPontoParada(proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]);
                if (this.pontoDeParadaAtivo) {
                    break;
                }
                
                retornoExecucao = this.executar(proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]);
            }

            this.pilhaEscoposExecucao.removerUltimo();
            this.escopoAtual--;
            return retornoExecucao;
        } else {
            const escopoExecucao: EscopoExecucao = {
                declaracoes: declaracoes,
                declaracaoAtual: 0,
                ambiente: ambiente || new Ambiente()
            }
            this.pilhaEscoposExecucao.empilhar(escopoExecucao);
            this.escopoAtual++;

            return this.executarUltimoEscopo();
        }
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
                } else {
                    this.pontoDeParadaAtivo = this.verificarPontoParada(ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]);
                    if (this.pontoDeParadaAtivo) {
                        break;
                    }
                }
                
                retornoExecucao = this.executar(ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]);
            }
        } catch (erro: any) {
            this.erros.push(erro);
        } finally {
            if (!this.pontoDeParadaAtivo) {
                this.pilhaEscoposExecucao.removerUltimo();
                if (manterAmbiente) {
                    const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();
                    escopoAnterior.ambiente.valores = Object.assign(escopoAnterior.ambiente.valores, 
                        ultimoEscopo.ambiente.valores);
                }
                this.escopoAtual--;
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
     * Continua a interprtação parcial. 
     * Quando o depurador continua, a pilha de execução do TypeScript é perdida. 
     * Esse método cria uma nova pilha de execução, começando do último elemento executado do 
     * primeiro escopo. 
     * @see executarBloco
     */
    continuarInterpretacaoParcial() {
        this.escopoAtual = 1;
        const primeiroEscopo = this.pilhaEscoposExecucao.naPosicao(1);
        --primeiroEscopo.declaracaoAtual;

        let retornoExecucao: any;
        for (; !(retornoExecucao instanceof Quebra) && primeiroEscopo.declaracaoAtual < primeiroEscopo.declaracoes.length; primeiroEscopo.declaracaoAtual++) {
            this.pontoDeParadaAtivo = this.verificarPontoParada(primeiroEscopo.declaracoes[primeiroEscopo.declaracaoAtual]);
            if (this.pontoDeParadaAtivo) {
                break;
            }
            
            retornoExecucao = this.executar(primeiroEscopo.declaracoes[primeiroEscopo.declaracaoAtual]);
        }

        this.pilhaEscoposExecucao.removerUltimo();

        if (this.pilhaEscoposExecucao.elementos() === 1) {
            this.finalizacaoDaExecucao();
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
        this.escopoAtual++;

        return this.executarUltimoEscopo(manterAmbiente);
    }
}