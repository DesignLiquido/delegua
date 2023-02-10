import { EspacoVariaveis } from '../espaco-variaveis';
import { Declaracao, Escreva, Retorna, Var } from '../declaracoes';
import { PontoParada } from '../depuracao';
import { ComandoDepurador, InterpretadorComDepuracaoInterface } from '../interfaces';
import { EscopoExecucao, TipoEscopoExecucao } from '../interfaces/escopo-execucao';
import { Quebra, RetornoQuebra } from '../quebras';
import { RetornoInterpretador } from '../interfaces/retornos/retorno-interpretador';
import { Atribuir, Chamada, Construto } from '../construtos';
import { inferirTipoVariavel } from './inferenciador';
import { InterpretadorBase } from './interpretador-base';

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
        extends InterpretadorBase 
        implements InterpretadorComDepuracaoInterface 
{
    pontosParada: PontoParada[];
    finalizacaoDaExecucao: Function;
    pontoDeParadaAtivo: boolean;
    avisoPontoParadaAtivado: Function;
    escopoAtual: number;
    comando?: ComandoDepurador;

    executandoChamada: boolean;
    proximoEscopo?: TipoEscopoExecucao;
    idChamadaAtual?: string;
    passos: number;

    constructor(diretorioBase: string, funcaoDeRetorno: Function) {
        super(diretorioBase, false, funcaoDeRetorno);

        this.pontosParada = [];
        this.pontoDeParadaAtivo = false;
        this.avisoPontoParadaAtivado = () => console.log('Aviso: Ponto de parada ativado.');
        this.escopoAtual = 0;
        this.executandoChamada = false;
        this.passos = 0;
    }

    /**
     * Resolve problema de literais que tenham vírgulas, e confundem a resolução de chamadas.
     * @param valor O valor do argumento, que pode ser um literal com virgulas.
     * @returns Uma string com vírgulas escapadas.
     */
    private escaparVirgulas(valor: any) {
        return String(valor).replace(/,/i, ',');
    }

    /**
     * Gera um identificador para resolução de chamadas.
     * Usado para não chamar funções repetidamente quando usando instruções
     * de passo, como "próximo" ou "adentrar-escopo".
     * @param expressao A expressão de chamada.
     * @returns Uma Promise que resolve como string.
     */
    private async gerarIdResolucaoChamada(expressao: Chamada): Promise<string> {
        const argumentosResolvidos = [];
        for (let argumento of expressao.argumentos) {
            argumentosResolvidos.push(await this.avaliar(argumento));
        }

        return argumentosResolvidos.reduce(
            (acumulador, argumento) =>
                (acumulador += `,${this.escaparVirgulas(
                    argumento.hasOwnProperty('valor') ? argumento.valor : argumento
                )}`),
            expressao.id
        );
    }

    async visitarExpressaoDeChamada(expressao: Chamada): Promise<any> {
        const _idChamadaComArgumentos = await this.gerarIdResolucaoChamada(expressao);
        // Usado na abertura do bloco de escopo da chamada.
        this.idChamadaAtual = _idChamadaComArgumentos;

        this.executandoChamada = true;
        this.proximoEscopo = 'funcao';
        const retorno = await super.visitarExpressaoDeChamada(expressao);
        this.executandoChamada = false;
        const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
        escopoAtual.ambiente.resolucoesChamadas[_idChamadaComArgumentos] = retorno;
        return retorno;
    }

    /**
     * A execução de uma atribuição de variável no interpretador com depuração pode ser em duas etapas.
     * O desenvolvedor pode inspecionar o lado direito e ir parando a execução usando
     * F10, por exemplo. Neste caso, a instrução aqui é executada duas vezes:
     * A primeira para armazenar o valor do lado direito em `this.valorRetornoEscopoAnterior`, e a
     * segunda para efetivamente atribuir o valor da variável.
     * @param expressao
     * @returns
     */
    async visitarDeclaracaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        if (expressao.valor instanceof Chamada) {
            const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
            const idChamadaComArgumentos = await this.gerarIdResolucaoChamada(expressao.valor);
            if (escopoAtual.ambiente.resolucoesChamadas.hasOwnProperty(idChamadaComArgumentos)) {
                const retornar = escopoAtual.ambiente.resolucoesChamadas[idChamadaComArgumentos];
                this.pilhaEscoposExecucao.atribuirVariavel(expressao.simbolo, retornar);

                delete escopoAtual.ambiente.resolucoesChamadas[idChamadaComArgumentos];
                return retornar;
            }
        }

        const valor = await this.avaliar(expressao.valor);
        this.pilhaEscoposExecucao.atribuirVariavel(expressao.simbolo, valor);

        return valor;
    }

    protected async avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            let resultadoAvaliacao: any;
            if (argumento instanceof Chamada) {
                const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
                const idChamadaComArgumentos = await this.gerarIdResolucaoChamada(argumento);
                if (escopoAtual.ambiente.resolucoesChamadas.hasOwnProperty(idChamadaComArgumentos)) {
                    resultadoAvaliacao = escopoAtual.ambiente.resolucoesChamadas[idChamadaComArgumentos];
                    delete escopoAtual.ambiente.resolucoesChamadas[idChamadaComArgumentos];
                } else {
                    resultadoAvaliacao = await this.avaliar(argumento);
                }
            } else {
                resultadoAvaliacao = await this.avaliar(argumento);
            }

            let valor = resultadoAvaliacao?.hasOwnProperty('valor') ? resultadoAvaliacao.valor : resultadoAvaliacao;

            formatoTexto += `${this.paraTexto(valor)} `;
        }

        return formatoTexto;
    }

    /**
     * Execução de uma escrita na saída configurada, que pode ser `console` (padrão) ou
     * alguma função para escrever numa página Web.
     * Se ponto de parada foi ativado durante a avaliação de argumentos, não escreve.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    async visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscreva(declaracao.argumentos);
            if (this.pontoDeParadaAtivo) {
                return null;
            }

            this.funcaoDeRetorno(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: declaracao.linha,
                hashArquivo: declaracao.hashArquivo,
            });
        }
    }

    /**
     * A execução de `var` no interpretador com depuração pode ser em duas etapas.
     * O desenvolvedor pode inspecionar o lado direito e ir parando a execução usando
     * F10, por exemplo. Neste caso, a instrução aqui é executada duas vezes:
     * A primeira para armazenar o valor do lado direito em `this.valorRetornoEscopoAnterior`, e a
     * segunda para efetivamente atribuir o valor da variável.
     * @param declaracao A declaração Var
     * @returns O valor do resultado resolvido, se a declaração resolveu.
     * Nulo ou indefinido em caso contrário.
     */
    async visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        if (declaracao.inicializador instanceof Chamada) {
            const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
            const idChamadaComArgumentos = await this.gerarIdResolucaoChamada(declaracao.inicializador);
            if (escopoAtual.ambiente.resolucoesChamadas.hasOwnProperty(idChamadaComArgumentos)) {
                const retornar = escopoAtual.ambiente.resolucoesChamadas[idChamadaComArgumentos];
                this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, retornar);

                delete escopoAtual.ambiente.resolucoesChamadas[idChamadaComArgumentos];
                return retornar;
            }
        }

        const valorFinal = await this.avaliacaoDeclaracaoVar(declaracao);
        if (valorFinal !== null && valorFinal !== undefined) {
            this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, valorFinal);
        }

        return valorFinal;
    }

    /**
     * Ao executar um retorno, manter o valor retornado no Interpretador para
     * uso por linhas que foram executadas com o comando `próximo` do depurador.
     * @param declaracao Uma declaracao Retorna
     * @returns O resultado da execução da visita.
     */
    async visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        const retorno = await super.visitarExpressaoRetornar(declaracao);

        // O escopo atual é marcado como finalizado, para notificar a
        // instrução de que deve ser descartado.
        const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
        escopoAtual.finalizado = true;

        // Acha o primeiro escopo de função.
        const escopoFuncao = this.pilhaEscoposExecucao.obterEscopoPorTipo('funcao');
        if (escopoFuncao === undefined) {
            return Promise.reject('retorna() chamado fora de execução de função.');
        }

        if (escopoFuncao.idChamada !== undefined) {
            escopoAtual.ambiente.resolucoesChamadas[escopoFuncao.idChamada] =
                retorno && retorno.hasOwnProperty('valor') ? retorno.valor : retorno;
        }

        return retorno;
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
        // Se o escopo atual não é o último.
        if (this.escopoAtual < this.pilhaEscoposExecucao.elementos() - 1) {
            this.escopoAtual++;
            const proximoEscopo = this.pilhaEscoposExecucao.naPosicao(this.escopoAtual);
            let retornoExecucao: any;

            // Sempre executa a próxima instrução, mesmo que haja ponto de parada.
            retornoExecucao = await this.executar(proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]);
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
                    this.avisoPontoParadaAtivado();
                    break;
                }

                retornoExecucao = await this.executar(proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]);

                // Um ponto de parada ativo pode ter vindo de um escopo mais interno.
                // Por isso verificamos outra parada aqui para evitar que
                // `this.declaracaoAtual` seja incrementado.
                if (this.pontoDeParadaAtivo) {
                    this.avisoPontoParadaAtivado();
                    break;
                }
            }

            this.pilhaEscoposExecucao.removerUltimo();
            this.escopoAtual--;
            return retornoExecucao;
        } else {
            this.abrirNovoBlocoEscopo(declaracoes, ambiente, this.proximoEscopo || 'outro');
            const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
            if (this.idChamadaAtual) {
                ultimoEscopo.idChamada = this.idChamadaAtual;
                this.idChamadaAtual = undefined;
            }
            this.proximoEscopo = undefined;

            if (this.comando !== 'adentrarEscopo') {
                return await this.executarUltimoEscopo();
            }
        }
    }

    /**
     * Para fins de depuração, verifica se há ponto de parada no mesmo pragma da declaração.
     * @param declaracao A declaração a ser executada.
     * @returns True quando execução deve parar. False caso contrário.
     */
    private verificarPontoParada(declaracao: Declaracao): boolean {
        const buscaPontoParada: PontoParada[] = this.pontosParada.filter(
            (p: PontoParada) => p.hashArquivo === declaracao.hashArquivo && p.linha === declaracao.linha
        );

        if (buscaPontoParada.length > 0) {
            console.log(`Ponto de parada encontrado. Linha: ${declaracao.linha}.`);
            return true;
        }

        return false;
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
    async executarUltimoEscopo(manterAmbiente = false, naoVerificarPrimeiraExecucao = false): Promise<any> {
        switch (this.comando) {
            case 'adentrarEscopo':
            case 'proximo':
                if (!this.executandoChamada) {
                    return this.executarUmPassoNoEscopo();
                } else {
                    return this.executarUltimoEscopoComandoContinuar(manterAmbiente, naoVerificarPrimeiraExecucao);
                }
            default:
                return this.executarUltimoEscopoComandoContinuar(manterAmbiente, naoVerificarPrimeiraExecucao);
        }
    }

    private async executarUmPassoNoEscopo() {
        const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        let retornoExecucao: any;
        if (this.passos > 0) {
            this.passos--;
            retornoExecucao = await this.executar(ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]);

            if (!this.pontoDeParadaAtivo) {
                ultimoEscopo.declaracaoAtual++;
            }

            if (ultimoEscopo.declaracaoAtual >= ultimoEscopo.declaracoes.length || ultimoEscopo.finalizado) {
                let outroEscopo = this.pilhaEscoposExecucao.topoDaPilha();
                if (retornoExecucao instanceof RetornoQuebra) {
                    while (outroEscopo.tipo !== 'funcao') {
                        this.pilhaEscoposExecucao.removerUltimo();
                        const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();
                        escopoAnterior.ambiente.resolucoesChamadas = Object.assign(
                            escopoAnterior.ambiente.resolucoesChamadas,
                            outroEscopo.ambiente.resolucoesChamadas
                        );
                        this.escopoAtual--;
                        outroEscopo = this.pilhaEscoposExecucao.topoDaPilha();
                    }
                }

                this.pilhaEscoposExecucao.removerUltimo();
                const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();
                escopoAnterior.ambiente.resolucoesChamadas = Object.assign(
                    escopoAnterior.ambiente.resolucoesChamadas,
                    outroEscopo.ambiente.resolucoesChamadas
                );
                this.escopoAtual--;
            }

            if (this.pilhaEscoposExecucao.elementos() === 1) {
                this.finalizacaoDaExecucao();
            }
        }

        return retornoExecucao;
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
    private async executarUltimoEscopoComandoContinuar(
        manterAmbiente = false,
        naoVerificarPrimeiraExecucao = false
    ): Promise<any> {
        const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        let retornoExecucao: any;

        try {
            for (
                ;
                !(retornoExecucao instanceof Quebra) && ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                if (naoVerificarPrimeiraExecucao) {
                    naoVerificarPrimeiraExecucao = false;
                } else {
                    this.pontoDeParadaAtivo = this.verificarPontoParada(
                        ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]
                    );

                    if (this.pontoDeParadaAtivo) {
                        this.avisoPontoParadaAtivado();
                        break;
                    }
                }

                retornoExecucao = await this.executar(ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]);

                // Um ponto de parada ativo pode ter vindo de um escopo mais interno.
                // Por isso verificamos outra parada aqui para evitar que
                // `this.declaracaoAtual` seja incrementado.
                if (this.pontoDeParadaAtivo) {
                    this.avisoPontoParadaAtivado();
                    break;
                }
            }

            return retornoExecucao;
        } finally {
            if (!this.pontoDeParadaAtivo && this.comando !== 'adentrarEscopo') {
                this.pilhaEscoposExecucao.removerUltimo();
                const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();
                escopoAnterior.ambiente.resolucoesChamadas = Object.assign(
                    escopoAnterior.ambiente.resolucoesChamadas,
                    ultimoEscopo.ambiente.resolucoesChamadas
                );

                if (manterAmbiente) {
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
     * Se entre escopos houver ponto de parada ativo, a execução é suspensa até o próximo comando
     * do desenvolvedor.
     * @see executarUltimoEscopo
     */
    async instrucaoContinuarInterpretacao(escopo = 1): Promise<any> {
        let retornoExecucao: any;
        if (escopo < this.escopoAtual) {
            retornoExecucao = await this.instrucaoContinuarInterpretacao(escopo + 1);
        }

        if (this.pontoDeParadaAtivo) {
            return;
        }

        await this.executarUltimoEscopoComandoContinuar(false, true);
    }

    /**
     * Empilha um escopo se for possível.
     * Se não for, apenas executa a instrução corrente.
     */
    async adentrarEscopo(): Promise<any> {
        throw new Error('Método não implementado.');
    }

    /**
     * Interpreta apenas uma instrução a partir do ponto de parada ativo, conforme comando do depurador.
     * Esse método cria uma nova pilha de execução do lado do JS, começando do último elemento executado do
     * primeiro escopo, subindo até o último elemento executado do último escopo.
     * @param escopo Indica o escopo a ser visitado. Usado para construir uma pilha de chamadas do lado JS.
     */
    async instrucaoPasso(escopo = 1) {
        this.passos = 1;
        const escopoVisitado = this.pilhaEscoposExecucao.naPosicao(escopo);

        if (escopoVisitado.declaracaoAtual >= escopoVisitado.declaracoes.length || escopoVisitado.finalizado) {
            this.pilhaEscoposExecucao.removerUltimo();
        }

        if (this.pilhaEscoposExecucao.elementos() === 1) {
            return this.finalizacaoDaExecucao();
        }

        if (escopo < this.escopoAtual) {
            await this.instrucaoPasso(escopo + 1);
        } else {
            await this.executarUmPassoNoEscopo();
        }
    }

    /**
     * Interpreta restante do bloco de execução em que o ponto de parada está, conforme comando do depurador.
     * Se houver outros pontos de parada no mesmo escopo à frente da instrução atual, todos são ignorados.
     * @param escopo Indica o escopo a ser visitado. Usado para construir uma pilha de chamadas do lado JS.
     */
    async instrucaoProximoESair() {
        this.executarUltimoEscopoComandoContinuar(false, true);
    }

    /**
     * Prepara a pilha de escopos para uma situação de depuração.
     * Não há execução de código neste caso.
     * @param declaracoes Um vetor de declarações.
     */
    prepararParaDepuracao(declaracoes: Declaracao[]): void {
        this.declaracoes = declaracoes;
        this.abrirNovoBlocoEscopo(declaracoes);
    }

    private abrirNovoBlocoEscopo(
        declaracoes: Declaracao[],
        ambiente?: EspacoVariaveis,
        tipoEscopo: TipoEscopoExecucao = 'outro'
    ) {
        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: ambiente || new EspacoVariaveis(),
            finalizado: false,
            tipo: tipoEscopo,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
        this.escopoAtual++;
    }

    /**
     * Reimplementando este método aqui porque a execução por depuração não requer
     * mostrar o resultado em momento algum, ou lidar com o retorno.
     * @param declaracao A declaracao a ser executada.
     * @param mostrarResultado Sempre falso.
     * @returns O resultado da execução.
     */
    async executar(declaracao: Declaracao, mostrarResultado = false): Promise<any> {
        return await declaracao.aceitar(this);
    }

    /**
     * Interpretação utilizada pelo depurador para avaliar valores de variáveis.
     * Diferentemente da interpretação tradicional, não possui indicadores
     * de performance porque eles não fazem sentido aqui.
     * @param declaracoes Um vetor de declarações.
     * @returns Um objeto de retorno, com erros encontrados se houverem.
     */
    async interpretar(declaracoes: Declaracao[], manterAmbiente = false): Promise<RetornoInterpretador> {
        this.erros = [];
        this.declaracoes = declaracoes;

        this.abrirNovoBlocoEscopo(declaracoes);
        const resultado = await super.executarUltimoEscopo(manterAmbiente);

        // Corrigir contador de escopos
        this.escopoAtual--;

        const retorno = {
            erros: this.erros,
            // resultado: this.resultadoInterpretador // Removido para simplificar `this.executar()`.
            resultado: [resultado],
        } as RetornoInterpretador;

        this.resultadoInterpretador = [];
        return retorno;
    }

    /**
     * Obtém o valor de uma variável por nome.
     * Em versões anteriores, o mecanismo de avaliação fazia toda a avaliação tradicional,
     * passando por Lexador, Avaliador Sintático e Interpretador.
     * Isso tem sua cota de problemas, sobretudo porque a avaliação insere e descarta escopos,
     * entrando em condição de corrida com a interpretação com depuração.
     * @param nome O nome da variável.
     */
    obterVariavel(nome: string): any {
        const valorOuVariavel = this.pilhaEscoposExecucao.obterValorVariavel({ lexema: nome } as any) as any;
        return valorOuVariavel.hasOwnProperty('valor')
            ? valorOuVariavel
            : {
                  valor: valorOuVariavel,
                  tipo: inferirTipoVariavel(valorOuVariavel),
              };
    }
}
