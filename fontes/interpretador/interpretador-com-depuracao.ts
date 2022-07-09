import { Ambiente } from '../ambiente';
import { Declaracao } from '../declaracoes';
import { PontoParada } from '../depuracao';
import { ImportadorInterface, InterpretadorComDepuracaoInterface, ResolvedorInterface } from '../interfaces';
import { EscopoExecucao } from '../interfaces/escopo-execucao';
import { Quebra } from '../quebras';
import { Interpretador } from './interpretador';
import { RetornoInterpretador } from '../interfaces/retornos/retorno-interpretador';

/**
 * Implementação do Interpretador com suporte a depuração.
 * Herda o Interpretador padrão de Delégua e implementa métodos a mais, que são
 * usados pelo servidor de depuração. 
 * Alguns métodos do Interpretador original, como `executarBloco` e `interpretar`, 
 * são reimplementados aqui.
 * 
 * A separação entre `Interpretador` e `InterpretadorComDepuracao` se faz 
 * necessária por uma série de motivos. 
 * O primeiro deles é o desempenho. A depuração torna o desempenho do 
 * Interpretador com depuração inferior ao Interpretador original pelas
 * várias verificações de controle que precisam ser feitas para a
 * funcionalidade do suporte a depuração, como verificar pontos de parada, 
 * estados da pilha de execução e variáveis. 
 * O segundo deles é manter o Interpretador original tão simples quanto possível. 
 * Uma implementação mais simples normalmente é mais robusta. 
 * O terceiro deles é o uso de memória. O Interpretador original não possui
 * uma série de variáveis implementadas aqui, o que o torna mais econômico em 
 * recursos de máquina.
 */
export class InterpretadorComDepuracao 
    extends Interpretador
    implements InterpretadorComDepuracaoInterface 
{
    pontosParada: PontoParada[];
    finalizacaoDaExecucao: Function;
    pontoDeParadaAtivo: boolean;
    escopoAtual: number;
    comandoAdentrarEscopo: boolean;
    comandoProximo: boolean;

    constructor(
        importador: ImportadorInterface,
        resolvedor: ResolvedorInterface,
        diretorioBase: string,
        funcaoDeRetorno: Function
    ) {
        super(importador, resolvedor, diretorioBase, false, funcaoDeRetorno);

        this.pontosParada = [];
        this.pontoDeParadaAtivo = false;
        this.escopoAtual = 0;
        this.comandoAdentrarEscopo = false;
        this.comandoProximo = false;
    }

    /**
     * Se bloco de execução já foi instanciado antes (por exemplo, quando há um ponto de parada e a
     * execução do código é retomada pelo depurador), retoma a execução do bloco do ponto em que havia parado.
     * Se bloco de execução ainda não foi instanciado, empilha declarações na pilha de escopos de execução,
     * cria um novo ambiente e executa as declarações empilhadas.
     * Se depurador comandou uma instrução 'adentrar-escopo', execução do bloco não ocorre, mas
     * ponteiros de escopo e execução são atualizados.
     * @param declaracoes Um vetor de declaracoes a ser executado.
     * @param ambiente O ambiente de execução quando houver, como parâmetros, argumentos, etc.
     */
    executarBloco(declaracoes: Declaracao[], ambiente?: Ambiente): any {
        if (this.escopoAtual < this.pilhaEscoposExecucao.elementos() - 1) {
            this.escopoAtual++;
            const proximoEscopo = this.pilhaEscoposExecucao.naPosicao(
                this.escopoAtual
            );
            let retornoExecucao: any;

            // Sempre executa a próxima instrução, mesmo que haja ponto de parada.
            retornoExecucao = this.executar(
                proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]
            );
            proximoEscopo.declaracaoAtual++;

            for (
                ;
                !(retornoExecucao instanceof Quebra) &&
                proximoEscopo.declaracaoAtual < proximoEscopo.declaracoes.length;
                proximoEscopo.declaracaoAtual++
            ) {
                this.pontoDeParadaAtivo = this.verificarPontoParada(
                    proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]
                );

                if (this.pontoDeParadaAtivo) {
                    break;
                }

                retornoExecucao = this.executar(
                    proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]
                );
            }

            this.pilhaEscoposExecucao.removerUltimo();
            this.escopoAtual--;
            return retornoExecucao;
        } else {
            const escopoExecucao: EscopoExecucao = {
                declaracoes: declaracoes,
                declaracaoAtual: 0,
                ambiente: ambiente || new Ambiente(),
            };
            this.pilhaEscoposExecucao.empilhar(escopoExecucao);
            this.escopoAtual++;

            if (this.comandoProximo) {
                // Quando o comando for 'próximo', não executa.
                // Aguarda o usuário com a próxima instrução vinda do depurador.
                return null;
            }

            if (!this.comandoAdentrarEscopo) {
                return this.executarUltimoEscopo();
            }
        }
    }

    /**
     * Para fins de depuração, verifica se há ponto de parada no mesmo pragma da declaração.
     * @param declaracao A declaração a ser executada.
     * @returns True quando execução deve parar. False caso contrário.
     */
    verificarPontoParada(declaracao: Declaracao): boolean {
        const buscaPontoParada: PontoParada[] = this.pontosParada.filter(
            (p: PontoParada) =>
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
     * @param manterAmbiente Se verdadeiro, junta elementos do último escopo com o escopo
     *                       imediatamente abaixo.
     * @param naoVerificarPrimeiraExecucao Booleano que pede ao Interpretador para não
     *                                     verificar o ponto de parada na primeira execução.
     *                                     Normalmente usado pelo Servidor de Depuração para continuar uma linha.
     * @returns Um objeto de retorno, com erros encontrados se houverem.
     */
    executarUltimoEscopo(
        manterAmbiente: boolean = false,
        naoVerificarPrimeiraExecucao: boolean = false
    ): any {
        const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();

        try {
            let retornoExecucao: any;
            for (
                ;
                !(retornoExecucao instanceof Quebra) &&
                ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                if (naoVerificarPrimeiraExecucao) {
                    naoVerificarPrimeiraExecucao = false;
                } else {
                    this.pontoDeParadaAtivo = this.verificarPontoParada(
                        ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]
                    );
                    if (this.pontoDeParadaAtivo) {
                        break;
                    }
                }

                retornoExecucao = this.executar(
                    ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]
                );
            }

            return retornoExecucao;
        } finally {
            if (!this.pontoDeParadaAtivo) {
                this.pilhaEscoposExecucao.removerUltimo();
                if (manterAmbiente) {
                    const escopoAnterior =
                        this.pilhaEscoposExecucao.topoDaPilha();
                    escopoAnterior.ambiente.valores = Object.assign(
                        escopoAnterior.ambiente.valores,
                        ultimoEscopo.ambiente.valores
                    );
                }
                this.escopoAtual--;
            }

            if (this.pilhaEscoposExecucao.elementos() === 1) {
                this.finalizacaoDaExecucao();
            }
        }
    }

    /**
     * Continua a interpretação, conforme comando do depurador.
     * Quando um ponto de parada é ativado, a pilha de execução do TypeScript é perdida.
     * Esse método cria uma nova pilha de execução do lado do JS, começando do último elemento executado do
     * primeiro escopo, subindo até o último elemento executado do último escopo.
     * Diferentemente de `executarUltimoEscopo`, este método descarta apenas um escopo (o que foi chamado).
     * @see executarBloco
     */
    continuarInterpretacao(): void {
        this.escopoAtual = 1;
        const primeiroEscopo = this.pilhaEscoposExecucao.naPosicao(1);

        let retornoExecucao: any;
        // Primeira execução sempre ocorre, independente de pontos de parada.
        retornoExecucao = this.executar(
            primeiroEscopo.declaracoes[primeiroEscopo.declaracaoAtual]
        );
        primeiroEscopo.declaracaoAtual++;
        
        for (
            ;
            !(retornoExecucao instanceof Quebra) &&
            primeiroEscopo.declaracaoAtual < primeiroEscopo.declaracoes.length;
            primeiroEscopo.declaracaoAtual++
        ) {
            this.pontoDeParadaAtivo = this.verificarPontoParada(
                primeiroEscopo.declaracoes[primeiroEscopo.declaracaoAtual]
            );
            if (this.pontoDeParadaAtivo) {
                break;
            }

            retornoExecucao = this.executar(
                primeiroEscopo.declaracoes[primeiroEscopo.declaracaoAtual]
            );
        }

        if (primeiroEscopo.declaracaoAtual >= primeiroEscopo.declaracoes.length) {
            this.pilhaEscoposExecucao.removerUltimo();
        }

        if (this.pilhaEscoposExecucao.elementos() === 1) {
            this.finalizacaoDaExecucao();
        }
    }

    /**
     * Interpreta apenas uma instrução a partir do ponto de parada ativo, conforme comando do depurador.
     * Esse método cria uma nova pilha de execução do lado do JS, começando do último elemento executado do
     * primeiro escopo, subindo até o último elemento executado do último escopo.
     * @param escopo Indica o escopo a ser visitado. Usado para construir uma pilha de chamadas do lado JS.
     */
    interpretacaoApenasUmaInstrucao(escopo: number = 1) {
        const escopoVisitado = this.pilhaEscoposExecucao.naPosicao(escopo);

        if (escopo < this.escopoAtual) {
            this.interpretacaoApenasUmaInstrucao(escopo + 1);
        } else {
            const declaracaoAtual = escopoVisitado.declaracoes[escopoVisitado.declaracaoAtual];
            this.executar(declaracaoAtual);
            // Blocos de escopo que não sejam de funções adentram 
            // o escopo ativo por padrão, por isso o teste abaixo.
            // this.adentrarEscopoAtivo = Object.getPrototypeOf(declaracaoAtual).constructor.name !== 'Funcao';
        }

        if (this.comandoAdentrarEscopo) {
            // Depurador comandou instrução 'adentrar-escopo', ou bloco de escopo
            // não é de uma função.
            // Instrução só foi realmente executada se não abriu novo bloco de escopo.
            // Por isso, `declaracaoAtual` não deve ser incrementada aqui.
            this.comandoAdentrarEscopo = false;
        } else {
            escopoVisitado.declaracaoAtual++;
        }

        // Se última instrução do escopo atual foi executada, descartar escopo.
        if (escopoVisitado.declaracoes.length - 1 <= escopoVisitado.declaracaoAtual) {
            this.pilhaEscoposExecucao.removerUltimo();
            this.escopoAtual--;
        }

        if (this.pilhaEscoposExecucao.elementos() === 1) {
            this.finalizacaoDaExecucao();
        }
    }

    /**
     * Interpreta restante do bloco de execução em que o ponto de parada está, conforme comando do depurador.
     * Se houver outros pontos de parada no mesmo escopo à frente da instrução atual, todos são ignorados. 
     * @param escopo Indica o escopo a ser visitado. Usado para construir uma pilha de chamadas do lado JS.
     */
    proximoESair(escopo: number = 1) {
        const escopoVisitado = this.pilhaEscoposExecucao.naPosicao(escopo);

        if (escopo < this.escopoAtual - 1) {
            this.proximoESair(escopo + 1);
        } else {
            const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();

            let retornoExecucao: any;
            for (
                ;
                !(retornoExecucao instanceof Quebra) &&
                ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                retornoExecucao = this.executar(
                    ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]
                );
            }

            this.pilhaEscoposExecucao.removerUltimo();
            this.escopoAtual--;
            escopoVisitado.declaracaoAtual++;
        }

        // Se última instrução do escopo atual foi executada, descartar escopo.
        if (escopoVisitado.declaracoes.length <= escopoVisitado.declaracaoAtual) {
            this.pilhaEscoposExecucao.removerUltimo();
            this.escopoAtual--;
        }

        if (this.pilhaEscoposExecucao.elementos() === 1) {
            this.finalizacaoDaExecucao();
        }
    }

    /**
     * Prepara a pilha de escopos para uma situação de depuração.
     * Não há execução de código neste caso.
     * @param declaracoes Um vetor de declarações.
     */
    prepararParaDepuracao(declaracoes: Declaracao[]): void {
        this.declaracoes = declaracoes;

        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: new Ambiente(),
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
        this.escopoAtual++;
    }

    /**
     * Interpretação utilizada pelo depurador. Pode encerrar ao encontrar um
     * ponto de parada ou não.
     * Diferentemente da interpretação tradicional, não possui indicadores
     * de performance porque eles não fazem sentido aqui.
     * @param declaracoes Um vetor de declarações.
     * @returns Um objeto de retorno, com erros encontrados se houverem.
     */
    interpretar(
        declaracoes: Declaracao[],
        manterAmbiente: boolean = false
    ): RetornoInterpretador {
        this.erros = [];
        this.declaracoes = declaracoes;

        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: new Ambiente(),
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
        this.escopoAtual++;

        this.executarUltimoEscopo(manterAmbiente);

        const retorno = {
            erros: this.erros,
            resultado: this.resultadoInterpretador,
        } as RetornoInterpretador;

        this.resultadoInterpretador = [];
        return retorno;
    }
}
