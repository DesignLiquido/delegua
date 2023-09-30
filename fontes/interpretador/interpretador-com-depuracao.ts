import { EspacoVariaveis } from '../espaco-variaveis';
import { Bloco, Declaracao, Enquanto, Escreva, Expressao, Fazer, Para, Retorna, Var } from '../declaracoes';
import { PontoParada } from '../depuracao';
import { ComandoDepurador, InterpretadorComDepuracaoInterface } from '../interfaces';
import { EscopoExecucao, TipoEscopoExecucao } from '../interfaces/escopo-execucao';
import { ContinuarQuebra, Quebra, RetornoQuebra, SustarQuebra } from '../quebras';
import { RetornoInterpretador } from '../interfaces/retornos/retorno-interpretador';
import { Chamada, Construto } from '../construtos';
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
export class InterpretadorComDepuracao extends InterpretadorBase implements InterpretadorComDepuracaoInterface {
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

    aoEncerrarEscopo: Function;

    constructor(diretorioBase: string, funcaoDeRetorno: Function, funcaoDeRetornoMesmaLinha: Function) {
        super(diretorioBase, false, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);

        this.pontosParada = [];
        this.pontoDeParadaAtivo = false;
        this.avisoPontoParadaAtivado = () => console.log('Aviso: Ponto de parada ativado.');
        this.escopoAtual = 0;
        this.executandoChamada = false;
        this.passos = 0;
    }

    /**
     * Quando um construto ou declaração possui id, significa que o interpretador
     * deve resolver a avaliação e guardar seu valor até o final do escopo.
     * Isso serve para quando a linguagem está em modo de depuração, e o contexto
     * da execução deixa de existir com um ponto de parada, por exemplo.
     * @param expressao A expressão a ser avaliada.
     * @returns O resultado da avaliação.
     */
    async avaliar(expressao: Construto | Declaracao): Promise<any> {
        if (expressao.hasOwnProperty('id')) {
            const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
            const idChamadaComArgumentos = await this.gerarIdResolucaoChamada(expressao);
            if (escopoAtual.ambiente.resolucoesChamadas.hasOwnProperty(idChamadaComArgumentos)) {
                return escopoAtual.ambiente.resolucoesChamadas[idChamadaComArgumentos];
            }
        }

        return await expressao.aceitar(this);
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
     * @returns Uma `Promise` que resolve como `string`.
     */
    private async gerarIdResolucaoChamada(expressao: any): Promise<string> {
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
     * O `while` do Node.js é bloqueante, sendo impossível pausar a execução. 
     * Por isso neste interpretador temos `enquanto` implementado de modo recursivo
     * com `setTimeout`, permitindo ao Node oportunidades para troca de contexto
     * e execução de outros processos no meio de uma execução de código Delégua.
     * Motivação: https://medium.com/@maxdignan/making-blocking-functions-non-blocking-in-javascript-dfeb9501301c
     */
    protected async enquantoRecursivo(
        escopoBloco: EscopoExecucao, 
        retornoExecucao: any, 
        declaracao: Enquanto
    ): Promise<any> {
        if (!(retornoExecucao instanceof Quebra) && 
            this.comando !== 'pausar' &&
            !this.pontoDeParadaAtivo
            // this.eVerdadeiro(await this.avaliar(declaracao.condicao))
        ) {
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        // retornoExecucao = await this.executar(declaracao.corpo);
                        if (escopoBloco === undefined) {
                            this.configurarBlocoEscopo(
                                (declaracao.corpo as Bloco).declaracoes, 
                                undefined,
                                new Expressao(declaracao.condicao),
                                undefined 
                            );
                            escopoBloco = this.pilhaEscoposExecucao.topoDaPilha();
                        }

                        let emPreCondicao = false;
                        if (escopoBloco.preCondicao !== undefined && 
                            !escopoBloco.preCondicaoExecutada &&
                            escopoBloco.declaracaoAtual === 0
                        ) {
                            emPreCondicao = true;
                        }
                        
                        retornoExecucao = await this.execucaoInternaEscopo(escopoBloco);
                        if (retornoExecucao instanceof SustarQuebra) {
                            return null;
                        }
        
                        if (retornoExecucao instanceof ContinuarQuebra) {
                            retornoExecucao = null;
                        }


                    } catch (erro: any) {
                        return reject(erro);
                    }
        
                    const resultadoRecursivo = await this.enquantoRecursivo(escopoBloco, retornoExecucao, declaracao);
                    resolve(resultadoRecursivo);
                }, 0);
            });
        }

        return this.posEnquantoRecursivo(escopoBloco, retornoExecucao);
    }

    protected posEnquantoRecursivo(escopoAtual: EscopoExecucao, retornoExecucao: any): any {
        escopoAtual.emLacoRepeticao = false;
        this.proximoEscopo = undefined;
        return retornoExecucao;
    }

    async visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> {
        const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
        // Laço de repetição passa a estar no escopo de cima, e
        // não mais aqui.
        // escopoAtual.emLacoRepeticao = true;
        escopoAtual.declaracaoAtual++;
        this.proximoEscopo = 'repeticao';

        let retornoExecucao: any;
        switch (this.comando) {
            case 'proximo':
                return await this.executarBloco(
                    (declaracao.corpo as Bloco).declaracoes, 
                    undefined,
                    new Expressao(declaracao.condicao),
                    undefined
                );
            default:
                return await this.enquantoRecursivo(undefined, retornoExecucao, declaracao);
        }

        /* switch (this.comando) {
            case "proximo":
                if (this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
                    return this.executarBloco((declaracao.corpo as Bloco).declaracoes);
                }

                escopoAtual.emLacoRepeticao = false;
                this.proximoEscopo = undefined;
                return null;
            default:
                let retornoExecucao: any;
                return await this.enquantoRecursivo(escopoAtual, retornoExecucao, declaracao);
                /* while (!(retornoExecucao instanceof Quebra) && 
                        !this.pontoDeParadaAtivo &&
                        this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
                while (
                    !(retornoExecucao instanceof Quebra) &&
                    !this.pontoDeParadaAtivo &&
                    this.eVerdadeiro(await this.avaliar(declaracao.condicao))
                ) {
                    escopoAtual.emLacoRepeticao = true;
                    try {
                        retornoExecucao = await this.executar(declaracao.corpo);
                        if (retornoExecucao instanceof SustarQuebra) {
                            return null;
                        }

                        if (retornoExecucao instanceof ContinuarQuebra) {
                            retornoExecucao = null;
                        }
                    } catch (erro: any) {
                        return Promise.reject(erro);
                    }
                }

                escopoAtual.emLacoRepeticao = false;
                return retornoExecucao; *
        } */
    }

    async avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            const resultadoAvaliacao = await this.avaliar(argumento);
            let valor = resultadoAvaliacao?.hasOwnProperty('valor') ? resultadoAvaliacao.valor : resultadoAvaliacao;
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

    protected async fazerRecursivo(
        escopoAtual: EscopoExecucao, 
        retornoExecucao: any, 
        declaracao: Fazer
    ): Promise<any> {
        if (!(retornoExecucao instanceof Quebra) && 
            this.comando === 'continuar' &&
            !this.pontoDeParadaAtivo &&
            this.eVerdadeiro(await this.avaliar(declaracao.condicaoEnquanto))
        ) {
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        retornoExecucao = await this.executar(declaracao.caminhoFazer);
                        if (retornoExecucao instanceof SustarQuebra) {
                            return null;
                        }
        
                        if (retornoExecucao instanceof ContinuarQuebra) {
                            retornoExecucao = null;
                        }
                    } catch (erro: any) {
                        return reject(erro);
                    }
        
                    const resultadoRecursivo = await this.fazerRecursivo(escopoAtual, retornoExecucao, declaracao);
                    resolve(resultadoRecursivo);
                }, 0);
            });
        }

        return this.posFazerRecursivo(escopoAtual, retornoExecucao);
    }

    protected posFazerRecursivo(escopoAtual: EscopoExecucao, retornoExecucao: any) {
        // TODO
    }

    async visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
        escopoAtual.emLacoRepeticao = true;
        this.proximoEscopo = 'repeticao';

        switch (this.comando) {
            case "proximo":
                const retornoBloco = this.executarBloco((declaracao.caminhoFazer as Bloco).declaracoes)
                /* if (this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
                    return this.executarBloco((declaracao.corpo as Bloco).declaracoes);
                }

                escopoAtual.emLacoRepeticao = false;
                this.proximoEscopo = undefined;
                return null; */
            default:
                let retornoExecucao: any;
                return await this.fazerRecursivo(escopoAtual, retornoExecucao, declaracao);
        }

        /* let retornoExecucao: any;
        do {
            try {
                retornoExecucao = await this.executar(declaracao.caminhoFazer);
                if (retornoExecucao instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracao.linha,
                    hashArquivo: declaracao.hashArquivo,
                });
                return Promise.reject(erro);
            }
        } while (
            !(retornoExecucao instanceof Quebra) &&
            this.eVerdadeiro(await this.avaliar(declaracao.condicaoEnquanto))
        ); */
    }

    protected async paraRecursivo(
        escopoAtual: EscopoExecucao, 
        retornoExecucao: any, 
        declaracao: Enquanto
    ): Promise<any> {
        if (!(retornoExecucao instanceof Quebra) && 
            this.comando === 'continuar' &&
            !this.pontoDeParadaAtivo &&
            this.eVerdadeiro(await this.avaliar(declaracao.condicao))
        ) {
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        retornoExecucao = await this.executar(declaracao.corpo);
                        if (retornoExecucao instanceof SustarQuebra) {
                            return null;
                        }
        
                        if (retornoExecucao instanceof ContinuarQuebra) {
                            retornoExecucao = null;
                        }
                    } catch (erro: any) {
                        return reject(erro);
                    }
        
                    const resultadoRecursivo = await this.paraRecursivo(escopoAtual, retornoExecucao, declaracao);
                    resolve(resultadoRecursivo);
                }, 0);
            });
        }

        return this.posParaRecursivo(escopoAtual, retornoExecucao);
    }

    protected posParaRecursivo(escopoAtual: EscopoExecucao, retornoExecucao: any) {
        // TODO
    }

    async visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        const corpoExecucao = declaracao.corpo as Bloco;
        if (declaracao.inicializador !== null && !declaracao.inicializada) {
            await this.avaliar(declaracao.inicializador);
            // O incremento vai ao final do bloco de escopo.
            if (declaracao.incrementar !== null) {
                corpoExecucao.declaracoes.push(declaracao.incrementar);
            }
        }

        declaracao.inicializada = true;
        const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
        switch (this.comando) {
            case 'proximo':
                if (declaracao.condicao !== null && this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
                    escopoAtual.emLacoRepeticao = true;

                    const resultadoBloco = this.executarBloco(corpoExecucao.declaracoes);
                    return resultadoBloco;
                }

                escopoAtual.emLacoRepeticao = false;
                return null;
            default:
                let retornoExecucao: any;
                /* while (!(retornoExecucao instanceof Quebra) && !this.pontoDeParadaAtivo) {
                    if (declaracao.condicao !== null && !this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
                        break;
                    }

                    try {
                        retornoExecucao = await this.executar(corpoExecucao);
                        if (retornoExecucao instanceof SustarQuebra) {
                            return null;
                        }

                        if (retornoExecucao instanceof ContinuarQuebra) {
                            retornoExecucao = null;
                        }
                    } catch (erro: any) {
                        return Promise.reject(erro);
                    }
                }
                // escopoAtual.emLacoRepeticao = false;
                return retornoExecucao; */
        }
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
     * Configuração comum de blocos de escopos, tanto por passo (genérica)
     * quanto por execução geral (normalmente envolvendo recursão).
     * @param declaracoes Um vetor de declaracoes a ser executado.
     * @param ambiente O ambiente de execução quando houver, como parâmetros, argumentos, etc.
     * @param preCondicao A pré-condição do bloco.
     * @param posCondicao A pós-condição do bloco. 
     */
    protected configurarBlocoEscopo(
        declaracoes: Declaracao[], 
        ambiente?: EspacoVariaveis,
        preCondicao?: Declaracao,
        posCondicao?: Declaracao
    ) {
        this.abrirNovoBlocoEscopo(declaracoes, ambiente, this.proximoEscopo || 'outro');
        const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        if (this.proximoEscopo === 'repeticao') {
            ultimoEscopo.emLacoRepeticao = true;
        }

        if (preCondicao !== undefined && preCondicao !== null) {
            ultimoEscopo.preCondicao = preCondicao;
        }

        if (posCondicao !== undefined && posCondicao !== null) {
            ultimoEscopo.posCondicao = posCondicao;
        }

        if (this.idChamadaAtual) {
            ultimoEscopo.idChamada = this.idChamadaAtual;
            this.idChamadaAtual = undefined;
        }

        this.proximoEscopo = undefined;
    }

    /**
     * Empilha declarações na pilha de escopos de execução,
     * cria um novo ambiente e executa as declarações empilhadas.
     * Se depurador comandou uma instrução 'adentrar-escopo', execução do bloco não ocorre, mas
     * ponteiros de escopo e execução são atualizados.
     * @param declaracoes Um vetor de declaracoes a ser executado.
     * @param ambiente O ambiente de execução quando houver, como parâmetros, argumentos, etc.
     * @param preCondicao A pré-condição do bloco.
     * @param posCondicao A pós-condição do bloco.
     */
    async executarBloco(
        declaracoes: Declaracao[], 
        ambiente?: EspacoVariaveis,
        preCondicao?: Declaracao,
        posCondicao?: Declaracao
    ): Promise<any> {
        this.configurarBlocoEscopo(declaracoes, ambiente, preCondicao, posCondicao);

        if (this.comando !== 'adentrarEscopo') {
            return await this.executarUltimoEscopo();
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

    /**
     * Descarta todos os escopos finalizados, do topo até a base, até achar
     * um escopo que ainda não finalizou.
     */
    private descartarTodosEscoposFinalizados() {
        let i = this.pilhaEscoposExecucao.pilha.length - 1;
        while (i > 0) {
            let ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
            if (ultimoEscopo.declaracaoAtual >= ultimoEscopo.declaracoes.length || ultimoEscopo.finalizado) {
                this.pilhaEscoposExecucao.removerUltimo();
                const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();
                escopoAnterior.ambiente.resolucoesChamadas = Object.assign(
                    escopoAnterior.ambiente.resolucoesChamadas,
                    ultimoEscopo.ambiente.resolucoesChamadas
                );
                this.escopoAtual--;
            } else {
                break;
            }
            i--;
        }
    }

    private descartarEscopoPorRetornoFuncao() {
        let ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        while (ultimoEscopo.tipo !== 'funcao') {
            this.pilhaEscoposExecucao.removerUltimo();
            const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();
            escopoAnterior.ambiente.resolucoesChamadas = Object.assign(
                escopoAnterior.ambiente.resolucoesChamadas,
                ultimoEscopo.ambiente.resolucoesChamadas
            );
            this.escopoAtual--;
            ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        }

        this.pilhaEscoposExecucao.removerUltimo();
        const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();
        escopoAnterior.ambiente.resolucoesChamadas = Object.assign(
            escopoAnterior.ambiente.resolucoesChamadas,
            ultimoEscopo.ambiente.resolucoesChamadas
        );
        this.escopoAtual--;
    }

    private async execucaoInternaEscopo(escopo: EscopoExecucao): Promise<any> {
        if (
            escopo.preCondicao !== undefined && 
            !escopo.preCondicaoExecutada &&
            escopo.declaracaoAtual === 0
        ) {
            escopo.preCondicaoExecutada = true;
            const resultadoPreCondicao = await this.executar(escopo.preCondicao);
            if (!resultadoPreCondicao) {
                escopo.finalizado = true;
            }
            return resultadoPreCondicao;
        }

        if (
            escopo.posCondicao !== undefined &&
            !escopo.posCondicaoExecutada &&
            escopo.declaracaoAtual >= escopo.declaracoes.length
        ) {
            escopo.posCondicaoExecutada = true;
            const resultadoPosCondicao = await this.executar(escopo.posCondicao);
            if (!resultadoPosCondicao) {
                escopo.finalizado = true;
            } else {
                escopo.declaracaoAtual == 0;
            }
            return resultadoPosCondicao;
        }

        return await this.executar(escopo.declaracoes[escopo.declaracaoAtual]);
    }

    private async executarUmPassoNoEscopo() {
        const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
        let retornoExecucao: any;

        if (this.passos <= 0) {
            return retornoExecucao;
        }

        this.passos--;
        let emPreCondicao = false;
        if (escopoAtual.preCondicao !== undefined && 
            !escopoAtual.preCondicaoExecutada &&
            escopoAtual.declaracaoAtual === 0
        ) {
            emPreCondicao = true;
        }

        retornoExecucao = await this.execucaoInternaEscopo(escopoAtual);

        if (!emPreCondicao && !this.pontoDeParadaAtivo) {
            escopoAtual.declaracaoAtual++;
        }

        if (escopoAtual.finalizado) {
            if (retornoExecucao instanceof RetornoQuebra) {
                this.descartarEscopoPorRetornoFuncao();
            } else {
                this.descartarTodosEscoposFinalizados();
            }
        } else if (escopoAtual.declaracaoAtual >= escopoAtual.declaracoes.length) {
            if (escopoAtual.emLacoRepeticao) {
                if (escopoAtual.posCondicao !== undefined &&
                    escopoAtual.posCondicaoExecutada
                ) {
                    if (retornoExecucao) {
                        escopoAtual.declaracaoAtual = 0;
                        escopoAtual.posCondicaoExecutada = false;
                    } else {
                        this.descartarTodosEscoposFinalizados();
                    }
                } else if (escopoAtual.preCondicao !== undefined) {
                    escopoAtual.declaracaoAtual = 0;
                    escopoAtual.preCondicaoExecutada = false;
                }
            } else {
                this.descartarTodosEscoposFinalizados();
            }
        }

        if (this.pilhaEscoposExecucao.elementos() === 1) {
            this.finalizacaoDaExecucao();
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
            while (!(retornoExecucao instanceof Quebra)) {
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

                let emPreCondicao = false;
                if (ultimoEscopo.preCondicao !== undefined && 
                    !ultimoEscopo.preCondicaoExecutada &&
                    ultimoEscopo.declaracaoAtual === 0
                ) {
                    emPreCondicao = true;
                }

                retornoExecucao = await this.execucaoInternaEscopo(ultimoEscopo);

                // Um ponto de parada ativo pode ter vindo de um escopo mais interno.
                // Por isso verificamos outra parada aqui para evitar que
                // `this.declaracaoAtual` seja incrementado.
                if (this.pontoDeParadaAtivo) {
                    this.avisoPontoParadaAtivado();
                    break;
                }

                if (!emPreCondicao) {
                    ultimoEscopo.declaracaoAtual++;
                }

                if (ultimoEscopo.finalizado) {
                    break;
                }

                if (ultimoEscopo.declaracaoAtual >= ultimoEscopo.declaracoes.length) {
                    if (ultimoEscopo.emLacoRepeticao) {
                        if (ultimoEscopo.posCondicao !== undefined &&
                            ultimoEscopo.posCondicaoExecutada
                        ) {
                            if (retornoExecucao) {
                                ultimoEscopo.declaracaoAtual = 0;
                                ultimoEscopo.posCondicaoExecutada = false;
                            }
                        } else if (ultimoEscopo.preCondicao !== undefined) {
                            ultimoEscopo.declaracaoAtual = 0;
                            ultimoEscopo.preCondicaoExecutada = false;
                        }
                    } else {
                        break;
                    }
                }
            }

            return retornoExecucao;
        } catch (erro: any) {
            this.erros.push(erro);
        } finally {
            if (!this.pontoDeParadaAtivo && !['adentrarEscopo', 'pausar'].includes(this.comando)) {
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

            // No caso específico da pausa, precisamos apontar para a última instrução do último escopo, 
            // que é normalmente quando o interpretador desbloqueia o laço de eventos do Node.
            if (this.comando === 'pausar') {
                this.escopoAtual = this.pilhaEscoposExecucao.elementos() - 1;
                const ultimoEscopoExecutado = this.pilhaEscoposExecucao.topoDaPilha();
                ultimoEscopoExecutado.declaracaoAtual = ultimoEscopoExecutado.declaracoes.length - 1;
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

        if (escopo < this.escopoAtual) {
            await this.instrucaoPasso(escopo + 1);
        } else {
            if (escopoVisitado.declaracaoAtual >= escopoVisitado.declaracoes.length || escopoVisitado.finalizado) {
                this.pilhaEscoposExecucao.removerUltimo();
            }

            if (this.pilhaEscoposExecucao.elementos() === 1) {
                return this.finalizacaoDaExecucao();
            }

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
            emLacoRepeticao: false,
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
