import { Binario, Chamada, Construto } from '../../construtos';
import { Declaracao, Enquanto, Escreva, Para, Retorna } from '../../declaracoes';
import { PontoParada } from '../../depuracao';
import {
    ComandoDepurador,
    InterpretadorComDepuracaoInterface,
    RetornoInterpretadorInterface,
} from '../../interfaces';
import { TipoEscopoExecucao } from '../../interfaces/escopo-execucao';
import { RetornoQuebra } from '../../quebras';
import { EspacoMemoria } from '../espaco-memoria';
import { InterpretadorBase } from '../interpretador-base';

import * as comum from './comum';

/**
 * Implementação do Interpretador Base com suporte a depuração.
 * Herda o Interpretador Base e implementa métodos a mais, que são
 * usados por ferramentas de depuração, como a [extensão de VSCode da Design Líquido](https://marketplace.visualstudio.com/items?itemName=designliquido.design-liquido).
 * Este Interpretador Base com depuração é usado pela maioria dos dialetos de Delégua.
 * Delégua e Pituguês utilizam uma outra implementação, o Interpretador com Depuração.
 * Alguns métodos do Interpretador original, como `executarBloco` e `interpretar`,
 * são reimplementados aqui.
 *
 * A separação entre `InterpretadorBase` e `InterpretadorBaseComDepuracao` se faz
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
 * @see InterpretadorComDepuracao
 */
export class InterpretadorBaseComDepuracao
    extends InterpretadorBase
    implements InterpretadorComDepuracaoInterface
{
    comando?: ComandoDepurador;
    pontoDeParadaAtivo: boolean;
    pontosParada: PontoParada[];
    avisoPontoParadaAtivado: Function;
    finalizacaoDaExecucao: Function;

    escopoAtual: number;
    executandoChamada: boolean;
    passos: number;
    idChamadaAtual?: string;
    proximoEscopo?: TipoEscopoExecucao;

    constructor(
        diretorioBase: string,
        funcaoDeRetorno: Function,
        funcaoDeRetornoMesmaLinha: Function
    ) {
        super(diretorioBase, false, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);

        this.pontosParada = [];
        this.pontoDeParadaAtivo = false;
        this.avisoPontoParadaAtivado = () => console.log('Aviso: Ponto de parada ativado.');
        this.escopoAtual = 0;
        this.executandoChamada = false;
        this.passos = 0;
    }

    obterVariavel(nome: string): any {
        return comum.obterVariavel(this, nome);
    }

    /**
     * Quando um construto ou declaração possui id, significa que o interpretador
     * deve resolver a avaliação e guardar seu valor até o final do escopo.
     * Isso serve para quando a linguagem está em modo de depuração, e o contexto
     * da execução deixa de existir com um ponto de parada, por exemplo.
     * @param expressao A expressão a ser avaliada.
     * @returns O resultado da avaliação.
     */
    override async avaliar(expressao: Construto | Declaracao): Promise<any> {
        return await comum.avaliar(this, expressao);
    }

    override async visitarExpressaoDeChamada(expressao: Chamada): Promise<any> {
        return await comum.visitarExpressaoDeChamada(
            this,
            super.visitarExpressaoDeChamada.bind(this),
            expressao
        );
    }

    override async visitarExpressaoBinaria(expressao: Binario): Promise<any> {
        return await comum.visitarExpressaoBinaria(
            this,
            // super.visitarExpressaoBinaria.bind(this),
            expressao
        );
    }

    override async visitarExpressaoReferenciaFuncao(expressao: any): Promise<any> {
        return await comum.visitarExpressaoReferenciaFuncao(
            this,
            super.visitarExpressaoReferenciaFuncao.bind(this),
            expressao
        );
    }

    override async visitarExpressaoArgumentoReferenciaFuncao(expressao: any): Promise<any> {
        return await comum.visitarExpressaoArgumentoReferenciaFuncao(
            this,
            super.visitarExpressaoArgumentoReferenciaFuncao.bind(this),
            expressao
        );
    }

    override async visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> {
        return await comum.visitarDeclaracaoEnquanto(this, declaracao);
    }

    override async avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            const resultadoAvaliacao = await this.avaliar(argumento);
            let valor = resultadoAvaliacao?.hasOwnProperty('valor')
                ? resultadoAvaliacao.valor
                : resultadoAvaliacao;
            formatoTexto += `${this.paraTexto(valor)} `;
        }

        return formatoTexto.trimEnd();
    }

    /**
     * Execução de uma escrita na saída configurada, que pode ser `console` (padrão) ou
     * alguma função para escrever numa página Web.
     * Se ponto de parada foi ativado durante a avaliação de argumentos, não escreve.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    override async visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> {
        return await comum.visitarDeclaracaoEscreva(this, declaracao);
    }

    override async visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        return await comum.visitarDeclaracaoPara(this, declaracao);
    }

    /**
     * Ao executar um retorno, manter o valor retornado no Interpretador para
     * uso por linhas que foram executadas com o comando `próximo` do depurador.
     * @param declaracao Uma declaracao Retorna
     * @returns O resultado da execução da visita.
     */
    override async visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        return await comum.visitarExpressaoRetornar(
            this,
            super.visitarExpressaoRetornar.bind(this),
            declaracao
        );
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
    override async executarBloco(
        declaracoes: Declaracao[],
        ambiente?: EspacoMemoria
    ): Promise<any> {
        return await comum.executarBloco(this, declaracoes, ambiente);
    }

    /**
     * No interpretador com depuração, este método é dividido em dois outros métodos privados:
     * - `this.executarUmPassoNoEscopo`, que executa apenas uma instrução e nada mais;
     * - `this.executarUltimoEscopoComandoContinuar`, que é a execução trivial de um escopo inteiro,
     *      ou com todas as instruções, ou até encontrar um ponto de parada.
     * @param manterAmbiente Se verdadeiro, junta elementos do último escopo com o escopo
     *                       imediatamente abaixo.
     * @param naoVerificarPrimeiraExecucao Booleano que pede ao Interpretador para não
     *                                     verificar o ponto de parada na primeira execução.
     *                                     Normalmente usado pelo Servidor de Depuração para continuar uma linha.
     * @returns O retorno da execução.
     */
    override async executarUltimoEscopo(
        manterAmbiente = false,
        naoVerificarPrimeiraExecucao = false
    ): Promise<any> {
        return await comum.executarUltimoEscopo(this, manterAmbiente, naoVerificarPrimeiraExecucao);
    }

    /**
     * Continua a interpretação, conforme comando do depurador.
     * Quando um ponto de parada é ativado, a pilha de execução do TypeScript é perdida.
     * Esse método cria uma nova pilha de execução do lado do JS, começando do último elemento executado do
     * primeiro escopo, subindo até o último elemento executado do último escopo.
     * Se entre escopos houver ponto de parada ativo, a execução é suspensa até o próximo comando
     * do desenvolvedor.
     * @see executarUltimoEscopo
     */
    async instrucaoContinuarInterpretacao(escopo = 1): Promise<any> {
        await comum.instrucaoContinuarInterpretacao(this, escopo);
    }

    /**
     * Empilha um escopo se for possível (comando "Step Into" do depurador).
     * Se a instrução corrente contém uma chamada de função, entra na função e pausa na primeira linha.
     * Se não houver chamada de função, comporta-se como "próximo" (comando de passo).
     *
     * Fluxo de execução:
     * 1. Define o comando como 'adentrarEscopo'
     * 2. Executa um passo (que pode ou não entrar em uma função)
     * 3. Se entrou em função, o escopo da função fica no topo da pilha pronto para executar
     * 4. Se não entrou, a instrução é executada normalmente
     * 5. Ativa ponto de parada para aguardar próximo comando do usuário
     */
    async adentrarEscopo(): Promise<any> {
        // Define o comando para indicar modo "adentrar escopo"
        this.comando = 'adentrarEscopo';

        // Limpa ponto de parada para permitir execução
        this.pontoDeParadaAtivo = false;

        // Executa um passo (que pode entrar em uma função se houver chamada)
        await this.instrucaoPasso();

        // Após execução, pausa para aguardar próximo comando do usuário
        // (a menos que um ponto de parada já tenha sido ativado durante a execução)
        if (!this.pontoDeParadaAtivo) {
            this.pontoDeParadaAtivo = true;
            this.avisoPontoParadaAtivado();
        }
    }

    /**
     * Interpreta apenas uma instrução a partir do ponto de parada ativo, conforme comando do depurador.
     * Esse método cria uma nova pilha de execução do lado do JS, começando do último elemento executado do
     * primeiro escopo, subindo até o último elemento executado do último escopo.
     * @param escopo Indica o escopo a ser visitado. Usado para construir uma pilha de chamadas do lado JS.
     */
    async instrucaoPasso(escopo = 1) {
        return await comum.instrucaoPasso(this, escopo);
    }

    /**
     * Interpreta restante do bloco de execução em que o ponto de parada está, conforme comando do depurador.
     * Se houver outros pontos de parada no mesmo escopo à frente da instrução atual, todos são ignorados.
     * @param escopo Indica o escopo a ser visitado. Usado para construir uma pilha de chamadas do lado JS.
     */
    async instrucaoProximoESair() {
        comum.executarUltimoEscopoComandoContinuar(this, false, true);
    }

    /**
     * Prepara a pilha de escopos para uma situação de depuração.
     * Não há execução de código neste caso.
     * @param declaracoes Um vetor de declarações.
     */
    prepararParaDepuracao(declaracoes: Declaracao[]): void {
        this.declaracoes = declaracoes;
        comum.abrirNovoBlocoEscopo(this, declaracoes);
    }

    /**
     * Reimplementando este método aqui porque a execução por depuração não requer
     * mostrar o resultado em momento algum, ou lidar com o retorno.
     * @param declaracao A declaracao a ser executada.
     * @param mostrarResultado Sempre falso.
     * @returns O resultado da execução.
     */
    override async executar(declaracao: Declaracao, mostrarResultado = false): Promise<any> {
        return await declaracao.aceitar(this);
    }

    /**
     * Interpretação utilizada pelo depurador para avaliar valores de variáveis.
     * Diferentemente da interpretação tradicional, não possui indicadores
     * de performance porque eles não fazem sentido aqui.
     * @param declaracoes Um vetor de declarações.
     * @returns Um objeto de retorno, com erros encontrados se houverem.
     */
    override async interpretar(
        declaracoes: Declaracao[],
        manterAmbiente = false
    ): Promise<RetornoInterpretadorInterface> {
        this.erros = [];
        this.declaracoes = declaracoes;

        comum.abrirNovoBlocoEscopo(this, declaracoes);
        const resultado = await super.executarUltimoEscopo(manterAmbiente);

        // Corrigir contador de escopos
        this.escopoAtual--;

        const retorno = {
            erros: this.erros,
            // resultado: this.resultadoInterpretador // Removido para simplificar `this.executar()`.
            resultado: [resultado],
        } as RetornoInterpretadorInterface;

        this.resultadoInterpretador = [];
        return retorno;
    }
}
