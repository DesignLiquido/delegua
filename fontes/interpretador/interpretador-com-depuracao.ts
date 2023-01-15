import { EspacoVariaveis } from '../espaco-variaveis';
import { Bloco, Classe, Continua, Declaracao, Enquanto, Escolha, Escreva, Expressao, Fazer, FuncaoDeclaracao, Importar, Leia, Para, Retorna, Se, Tente, Var } from '../declaracoes';
import { PontoParada } from '../depuracao';
import {
    ImportadorInterface,
    InterpretadorComDepuracaoInterface,
} from '../interfaces';
import { EscopoExecucao, TipoEscopoExecucao } from '../interfaces/escopo-execucao';
import { ContinuarQuebra, Quebra, RetornoQuebra, SustarQuebra } from '../quebras';
import { Interpretador } from './interpretador';
import { RetornoInterpretador } from '../interfaces/retornos/retorno-interpretador';
import { AcessoIndiceVariavel, Agrupamento, Atribuir, Binario, FormatacaoEscrita, Literal, Logico, Unario, Variavel } from '../construtos';
import { DeleguaFuncao } from '../estruturas';

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
    precisaAdentrarBlocoEscopo: boolean;
    valorRetornoEscopoAnterior: any;
    proximoEscopo?: TipoEscopoExecucao;

    constructor(
        importador: ImportadorInterface,
        diretorioBase: string,
        funcaoDeRetorno: Function
    ) {
        super(importador, diretorioBase, false, funcaoDeRetorno);

        this.pontosParada = [];
        this.pontoDeParadaAtivo = false;
        this.escopoAtual = 0;
        this.comandoAdentrarEscopo = false;
        this.comandoProximo = false;
        this.precisaAdentrarBlocoEscopo = false;
    }

    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarExpressaoLeia(expressao);
    }

    visitarExpressaoLiteral(expressao: Literal): any {
        this.precisaAdentrarBlocoEscopo = false;
        return super.visitarExpressaoLiteral(expressao);
    }

    async visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarExpressaoAgrupamento(expressao);
    }

    async visitarExpressaoUnaria(expressao: Unario): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarExpressaoUnaria(expressao);
    }

    async visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<string> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarExpressaoFormatacaoEscrita(declaracao);
    }

    async visitarExpressaoBinaria(expressao: Binario): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarExpressaoBinaria(expressao);
    }

    async visitarExpressaoDeChamada(expressao: any): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        this.proximoEscopo = 'funcao';
        return await super.visitarExpressaoDeChamada(expressao);
    }

    async visitarDeclaracaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarDeclaracaoDeAtribuicao(expressao);
    }

    visitarExpressaoDeVariavel(expressao: Variavel): any {
        this.precisaAdentrarBlocoEscopo = false;
        return super.visitarExpressaoDeVariavel(expressao);
    }

    async visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarDeclaracaoDeExpressao(declaracao);
    }

    async visitarExpressaoLogica(expressao: Logico): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarExpressaoLogica(expressao);
    }

    async visitarDeclaracaoSe(declaracao: Se): Promise<any> {
        this.precisaAdentrarBlocoEscopo = true;
        return await super.visitarDeclaracaoSe(declaracao);
    }

    async visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        this.precisaAdentrarBlocoEscopo = true;
        return await super.visitarDeclaracaoPara(declaracao);
    }

    async visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        this.precisaAdentrarBlocoEscopo = true;
        return await super.visitarDeclaracaoFazer(declaracao);
    }

    async visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any> {
        this.precisaAdentrarBlocoEscopo = true;
        return await super.visitarDeclaracaoEscolha(declaracao);
    }

    async visitarDeclaracaoTente(declaracao: Tente): Promise<any> {
        this.precisaAdentrarBlocoEscopo = true;
        return await super.visitarDeclaracaoTente(declaracao);
    }

    async visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> {
        this.precisaAdentrarBlocoEscopo = true;
        return await super.visitarDeclaracaoEnquanto(declaracao);
    }

    async visitarDeclaracaoImportar(declaracao: Importar): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarDeclaracaoImportar(declaracao);
    }

    async visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarDeclaracaoEscreva(declaracao);
    }

    async visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        this.precisaAdentrarBlocoEscopo = true;
        return await super.visitarExpressaoBloco(declaracao);
    }

    async visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarDeclaracaoVar(declaracao);
    }

    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        this.precisaAdentrarBlocoEscopo = false;
        return super.visitarExpressaoContinua(declaracao);
    }

    visitarExpressaoSustar(declaracao?: any): SustarQuebra {
        this.precisaAdentrarBlocoEscopo = false;
        return super.visitarExpressaoSustar(declaracao);
    }

    /**
     * Ao executar um retorno, manter o valor retornado no Interpretador para
     * uso por linhas que foram executadas com o comando `próximo` do depurador.
     * @param declaracao Uma declaracao Retorna
     * @returns O resultado da execução da visita.
     */
    async visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        this.precisaAdentrarBlocoEscopo = false;
        const retorno = await super.visitarExpressaoRetornar(declaracao);
        this.valorRetornoEscopoAnterior = retorno.valor;
        return retorno;
    }

    visitarExpressaoDeleguaFuncao(declaracao: any): DeleguaFuncao {
        this.precisaAdentrarBlocoEscopo = false;
        return super.visitarExpressaoDeleguaFuncao(declaracao);
    }

    async visitarExpressaoAtribuicaoSobrescrita(expressao: any): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarExpressaoAtribuicaoSobrescrita(expressao);
    }

    async visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel | any): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarExpressaoAcessoIndiceVariavel(expressao);
    }

    async visitarExpressaoDefinirValor(expressao: any): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarExpressaoDefinirValor(expressao);
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        this.precisaAdentrarBlocoEscopo = false;
        return super.visitarDeclaracaoDefinicaoFuncao(declaracao);
    }

    async visitarDeclaracaoClasse(declaracao: Classe): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarDeclaracaoClasse(declaracao);
    }

    async visitarExpressaoAcessoMetodo(expressao: any): Promise<any> {
        this.precisaAdentrarBlocoEscopo = false;
        return await super.visitarExpressaoAcessoMetodo(expressao);
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
    async executarBloco(declaracoes: Declaracao[], ambiente?: EspacoVariaveis): Promise<any> {
        if (this.escopoAtual < this.pilhaEscoposExecucao.elementos() - 1) {
            this.escopoAtual++;
            const proximoEscopo = this.pilhaEscoposExecucao.naPosicao(
                this.escopoAtual
            );
            let retornoExecucao: any;

            // Sempre executa a próxima instrução, mesmo que haja ponto de parada.
            retornoExecucao = await this.executar(
                proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]
            );
            proximoEscopo.declaracaoAtual++;

            for (
                ;
                !(retornoExecucao instanceof Quebra) &&
                proximoEscopo.declaracaoAtual <
                    proximoEscopo.declaracoes.length;
                proximoEscopo.declaracaoAtual++
            ) {
                this.pontoDeParadaAtivo = this.verificarPontoParada(
                    proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]
                );

                if (this.pontoDeParadaAtivo) {
                    break;
                }

                retornoExecucao = await this.executar(
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
                ambiente: ambiente || new EspacoVariaveis(),
                finalizado: false,
                tipo: this.proximoEscopo || 'outro'
            };
            this.pilhaEscoposExecucao.empilhar(escopoExecucao);
            this.escopoAtual++;
            this.proximoEscopo = undefined;

            if (!this.precisaAdentrarBlocoEscopo) {
                return await this.executarUltimoEscopo();
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
    async executarUltimoEscopo(
        manterAmbiente = false,
        naoVerificarPrimeiraExecucao = false
    ): Promise<any> {
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

                retornoExecucao = await this.executar(
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
    async continuarInterpretacao(): Promise<any> {
        this.escopoAtual = 1;
        const primeiroEscopo = this.pilhaEscoposExecucao.naPosicao(1);

        let retornoExecucao: any;
        // Primeira execução sempre ocorre, independente de pontos de parada.
        retornoExecucao = await this.executar(
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

            retornoExecucao = await this.executar(
                primeiroEscopo.declaracoes[primeiroEscopo.declaracaoAtual]
            );
        }

        if (
            primeiroEscopo.declaracaoAtual >= primeiroEscopo.declaracoes.length
        ) {
            this.pilhaEscoposExecucao.removerUltimo();
        }

        if (this.pilhaEscoposExecucao.elementos() === 1) {
            this.finalizacaoDaExecucao();
        }
    }

    private descartarEscoposFinalizadosPorFuncao() {
        let escopo: EscopoExecucao;
        do {
            escopo = this.pilhaEscoposExecucao.topoDaPilha();
            this.pilhaEscoposExecucao.removerUltimo();
            this.escopoAtual--;
        }
        while (escopo.tipo !== 'funcao');
    }

    private descartarEscoposFinalizados(numeroEscopo: number) {
        // Se última instrução do escopo atual foi executada, e
        // escopos adicionais não foram criados com a última execução,
        // descartar este e todos os escopos abaixo deste que também estejam na última instrução.
        if (numeroEscopo !== this.pilhaEscoposExecucao.pilha.length - 1) {
            return;
        }
            
        let numeroEscopoAtual = numeroEscopo;
        while (numeroEscopoAtual > 0) {
            const escopo = this.pilhaEscoposExecucao.pilha[numeroEscopoAtual];
            if (escopo.declaracoes.length == escopo.declaracaoAtual || escopo.finalizado) {
                this.pilhaEscoposExecucao.removerUltimo();
                this.escopoAtual--;
            }
            numeroEscopoAtual--;
        }
    }

    /**
     * Empilha um escopo se for possível.
     * Se não for, apenas executa a instrução corrente.
     */
    async adentrarEscopo(): Promise<any> {
        throw new Error('Method not implemented.');
    }

    /**
     * Interpreta apenas uma instrução a partir do ponto de parada ativo, conforme comando do depurador.
     * Esse método cria uma nova pilha de execução do lado do JS, começando do último elemento executado do
     * primeiro escopo, subindo até o último elemento executado do último escopo.
     * @param escopo Indica o escopo a ser visitado. Usado para construir uma pilha de chamadas do lado JS.
     */
    async interpretarApenasUmaInstrucao(escopo = 1) {
        const escopoVisitado = this.pilhaEscoposExecucao.naPosicao(escopo);

        if (escopo < this.escopoAtual) {
            this.interpretarApenasUmaInstrucao(escopo + 1);
        } else {
            const declaracaoAtual =
                escopoVisitado.declaracoes[escopoVisitado.declaracaoAtual];
            const retornoExecucao = await this.executar(declaracaoAtual);

            // Se o retorno da execução é uma instância de Quebra, o escopo corrente finalizou.
            if (retornoExecucao instanceof Quebra) {
                escopoVisitado.finalizado = true;
                this.descartarEscoposFinalizadosPorFuncao();
            } else {
                escopoVisitado.declaracaoAtual++;
                this.descartarEscoposFinalizados(escopo);
            }       
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
    async proximoESair(escopo = 1) {
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
                retornoExecucao = await this.executar(
                    ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]
                );
            }

            this.pilhaEscoposExecucao.removerUltimo();
            this.escopoAtual--;
            escopoVisitado.declaracaoAtual++;
        }

        // Se última instrução do escopo atual foi executada, descartar escopo.
        if (
            escopoVisitado.declaracoes.length <= escopoVisitado.declaracaoAtual
        ) {
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
            ambiente: new EspacoVariaveis(),
            finalizado: false,
            tipo: 'outro'
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
    async interpretar(
        declaracoes: Declaracao[],
        manterAmbiente = false
    ): Promise<RetornoInterpretador> {
        this.erros = [];
        this.declaracoes = declaracoes;

        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
            finalizado: false,
            tipo: 'outro'
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
        this.escopoAtual++;

        await this.executarUltimoEscopo(manterAmbiente);

        const retorno = {
            erros: this.erros,
            resultado: this.resultadoInterpretador,
        } as RetornoInterpretador;

        this.resultadoInterpretador = [];
        return retorno;
    }
}
