import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Construto,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    ComentarioComoConstruto,
    DefinirValor,
    Dicionario,
    Dupla,
    EnquantoComoConstruto,
    FazerComoConstruto,
    ListaCompreensao,
    Leia,
    Literal,
    ParaCadaComoConstruto,
    ParaComoConstruto,
    Separador,
    TipoDe,
    Unario,
    Variavel,
    Vetor,
    ImportarComoConstruto,
    Elvis,
    SeTernario,
    Tupla,
    TuplaN,
    AjudaComoConstruto,
} from '../construtos';
import {
    DeleguaFuncao,
    DeleguaModulo,
    DescritorTipoClasse,
    MetodoPrimitiva,
    ObjetoDeleguaClasse,
    ObjetoPadrao,
    ReferenciaMontao,
} from './estruturas';
import {
    ResultadoParcialInterpretadorInterface,
    RetornoInterpretadorInterface,
    SimboloInterface,
    VariavelInterface,
    VisitanteDeleguaInterface,
} from '../interfaces';
import { InterpretadorBase } from './interpretador-base';
import { inferirTipoVariavel } from '../inferenciador';
import { ErroEmTempoDeExecucao } from '../excecoes';
import {
    Ajuda,
    Const,
    ConstMultiplo,
    Declaracao,
    Enquanto,
    Escreva,
    Fazer,
    FuncaoDeclaracao,
    InterfaceDeclaracao,
    Para,
    ParaCada,
    Retorna,
    TendoComo,
    Var,
    VarMultiplo,
} from '../declaracoes';
import { ContinuarQuebra, Quebra, RetornoQuebra, SustarQuebra } from '../quebras';
import { Montao } from './montao';
import {
    EnquantoInterface,
    FazerInterface,
    ParaCadaInterface,
    ParaInterface,
} from '../interfaces/delegua';

import { carregarBibliotecasGlobais, pontoEntradaAjuda } from './comum';

import primitivasDicionario from '../bibliotecas/primitivas-dicionario';
import primitivasNumero from '../bibliotecas/primitivas-numero';
import primitivasTexto from '../bibliotecas/primitivas-texto';
import primitivasVetor from '../bibliotecas/primitivas-vetor';
import primitivasTupla from '../bibliotecas/dialetos/pitugues/primitivas-tupla';

import tipoDeDadosPrimitivos from '../tipos-de-dados/primitivos';
import tipoDeDadosDelegua from '../tipos-de-dados/delegua';
import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

/**
 * O interpretador de Delégua, usado também por Pituguês usando herança.
 * @see InterpretadorPitugues
 */
export class Interpretador extends InterpretadorBase implements VisitanteDeleguaInterface {
    montao: Montao;
    acumularRetornos: boolean;

    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        super(diretorioBase, performance, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.montao = new Montao();
        this.pontoInicializacaoBibliotecasGlobais();
    }

    /**
     * Cada dialeto que deriva deste interpretador conhece este ponto de inicialização.
     * A partir daqui, cada dialeto pode carregar as bibliotecas globais específicas do seu dialeto.
     */
    protected pontoInicializacaoBibliotecasGlobais() {
        carregarBibliotecasGlobais(this.pilhaEscoposExecucao);
    }

    protected override async avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string> {
        if (this.constructor !== Interpretador) {
            return await super.avaliarArgumentosEscreva(argumentos);
        }

        let formatoTexto = '';

        for (const argumento of argumentos) {
            let resultadoAvaliacao = await this.avaliar(argumento);
            if (
                resultadoAvaliacao &&
                resultadoAvaliacao.hasOwnProperty &&
                resultadoAvaliacao.hasOwnProperty('valorRetornado')
            ) {
                resultadoAvaliacao = resultadoAvaliacao.valorRetornado;
            }

            if (argumento instanceof Atribuir || argumento instanceof AtribuicaoPorIndice) {
                formatoTexto += `${argumento.paraTexto()} `;
                continue;
            }

            const valor = this.resolverValor(resultadoAvaliacao);
            formatoTexto += `${this.paraTexto(valor)} `;
        }

        return formatoTexto.trimEnd();
    }

    protected resolverReferenciaMontao(referenciaMontao: ReferenciaMontao) {
        const valorMontao = this.montao.obterReferencia(
            this.hashArquivoDeclaracaoAtual,
            this.linhaDeclaracaoAtual,
            referenciaMontao.endereco
        );

        return valorMontao;
    }

    override resolverValor(objeto: any, referencia: boolean = false) {
        if (objeto === null || objeto === undefined) {
            return objeto;
        }

        if (Array.isArray(objeto)) {
            return objeto;
        }

        if (objeto instanceof ReferenciaMontao) {
            return this.resolverReferenciaMontao(objeto);
        }

        if (objeto instanceof RetornoQuebra) {
            return this.resolverValor(objeto.valor);
        }

        if (objeto.hasOwnProperty) {
            if (objeto.hasOwnProperty('valorRetornado')) {
                return this.resolverValor(objeto.valorRetornado);
            }

            if (objeto.hasOwnProperty('valor')) {
                if (Array.isArray(objeto.valor)) {
                    return this.resolverValor(objeto.valor);
                }

                if (objeto.valor instanceof ReferenciaMontao) {
                    return this.resolverReferenciaMontao(objeto.valor);
                }

                return objeto.valor;
            }
        }

        return objeto;
    }

    private serializarSemEspacos(objeto: any): string {
        return JSON.stringify(objeto).replace(/,\s+/g, ',').replace(/:\s+/g, ':');
    }

    override paraTexto(objeto: any): string {
        if (objeto === null || objeto === undefined) return tipoDeDadosDelegua.NULO;
        if (typeof objeto === tipoDeDadosPrimitivos.BOOLEANO) {
            return objeto ? 'verdadeiro' : 'falso';
        }

        if (objeto instanceof ReferenciaMontao) {
            objeto = this.resolverReferenciaMontao(objeto);
        }

        if (objeto.valor instanceof ObjetoPadrao) return objeto.valor.paraTexto();
        if (objeto instanceof Literal || objeto instanceof Tupla) return objeto.paraTextoSaida();
        if (
            objeto instanceof ObjetoDeleguaClasse ||
            objeto instanceof DeleguaFuncao ||
            objeto instanceof DescritorTipoClasse
        )
            return objeto.paraTexto();

        if (objeto instanceof RetornoQuebra) {
            if (typeof objeto.valor === 'boolean') return objeto.valor ? 'verdadeiro' : 'falso';
        }

        if (objeto instanceof MetodoPrimitiva) {
            return objeto.paraTexto();
        }

        if (objeto instanceof Date) {
            const formato = Intl.DateTimeFormat('pt', {
                dateStyle: 'full',
                timeStyle: 'full',
            });
            return formato.format(objeto);
        }

        if (Array.isArray(objeto)) {
            let retornoVetor: string = '[';
            for (let elemento of objeto) {
                // Resolve referências ao montão antes de processar
                if (elemento instanceof ReferenciaMontao) {
                    elemento = this.resolverValor(elemento);
                }

                if (elemento instanceof Tupla) {
                    retornoVetor += elemento.paraTextoSaida() + ', ';
                    continue;
                }

                // Se o elemento é um array (incluindo arrays resolvidos de referências),
                // chama paraTexto recursivamente para processá-lo corretamente
                if (Array.isArray(elemento)) {
                    retornoVetor += this.paraTexto(elemento) + ', ';
                    continue;
                }

                if (typeof elemento === 'object') {
                    retornoVetor += `${this.serializarSemEspacos(elemento)}, `;
                    continue;
                }
                retornoVetor +=
                    typeof elemento === 'string'
                        ? `'${elemento}', `
                        : `${this.paraTexto(elemento)}, `;
            }

            if (retornoVetor.length > 1) {
                retornoVetor = retornoVetor.slice(0, -2);
            }
            retornoVetor += ']';

            return retornoVetor;
        }

        if (typeof objeto === tipoDeDadosPrimitivos.OBJETO) {
            const objetoEscrita = {};
            for (const propriedade in objeto) {
                let valor = objeto[propriedade];
                if (typeof valor === tipoDeDadosPrimitivos.BOOLEANO) {
                    valor = valor ? 'verdadeiro' : 'falso';
                }

                if (
                    valor instanceof ReferenciaMontao ||
                    (valor?.hasOwnProperty && valor?.hasOwnProperty('tipo'))
                ) {
                    valor = this.resolverValor(valor);
                }

                objetoEscrita[propriedade] = valor;
            }

            return JSON.stringify(objetoEscrita);
        }

        switch (objeto.constructor) {
            case Object:
                if ('tipo' in objeto) {
                    switch (objeto.tipo) {
                        case 'dicionário':
                            return JSON.stringify(objeto.valor);
                        default:
                            return objeto.valor;
                    }
                }
        }

        return objeto.toString();
    }

    override async avaliacaoDeclaracaoVarOuConst(
        declaracao: Const | ConstMultiplo | Var | VarMultiplo
    ): Promise<any> {
        let valorOuOutraVariavel = null;
        if (declaracao.inicializador !== null) {
            valorOuOutraVariavel = await this.avaliar(declaracao.inicializador);
        }

        let valorFinal = null;
        if (valorOuOutraVariavel !== null && valorOuOutraVariavel !== undefined) {
            valorFinal = this.resolverValor(valorOuOutraVariavel);
        }

        return valorFinal;
    }

    /**
     * Declaração de ajuda.
     * Neste interpretador básico, a ajuda apenas retorna texto sobre um determinado
     * tópico, ou ainda sobre a ajuda em si.
     * Outros ambientes implementam mecanismos mais sofisticados, como o modo de ajuda.
     * @param declaracao A declaração de ajuda.
     */
    visitarDeclaracaoInterface(_declaracao: InterfaceDeclaracao): Promise<any> {
        // Interfaces não possuem comportamento em tempo de execução.
        return Promise.resolve();
    }

    async visitarDeclaracaoAjuda(declaracao: Ajuda): Promise<any> {
        return Promise.resolve(pontoEntradaAjuda(declaracao.funcao, declaracao.elemento));
    }

    override async visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): Promise<any> {
        let funcao: any = new DeleguaFuncao(declaracao.simbolo.lexema, declaracao.funcao);
        funcao.documentacao = declaracao.documentacao;

        if (declaracao.decoradores && declaracao.decoradores.length > 0) {
            for (const decorador of [...declaracao.decoradores].reverse()) {
                const nomeDecorador = decorador.nome.slice(1);
                const variavelDecoradora =
                    this.pilhaEscoposExecucao.obterVariavelPorNome(nomeDecorador);
                const funcaoDecoradora: DeleguaFuncao = variavelDecoradora.valor;
                const resultado = await funcaoDecoradora.chamar(this, [
                    { nome: null, valor: funcao },
                ]);
                funcao = this.resolverValorRecursivo(resultado);
            }
        }

        // TODO: Depreciar essa abordagem a favor do uso por referências?
        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, funcao);
        this.pilhaEscoposExecucao.registrarReferenciaFuncao(declaracao.id, funcao);

        return Promise.resolve({
            tipo: `função<${funcao.declaracao?.tipo || 'qualquer'}>`,
            tipoExplicito: funcao.declaracao?.tipoExplicito,
            declaracao: funcao,
        });
    }

    protected async logicaComumExecucaoEnquanto(
        enquanto: EnquantoInterface,
        acumularRetornos: boolean
    ) {
        let retornoExecucao: ResultadoParcialInterpretadorInterface;
        const retornos = [];
        while (
            (acumularRetornos ||
                !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra)) &&
            this.eVerdadeiro(await this.avaliar(enquanto.condicao))
        ) {
            try {
                retornoExecucao = await this.executar(enquanto.corpo);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                    if (acumularRetornos) {
                        return {
                            valorRetornado: retornos,
                            tipo: 'vetor',
                        };
                    }

                    return null;
                }

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }

                if (acumularRetornos) {
                    retornos.push(this.resolverValor(retornoExecucao));
                }
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: enquanto.linha,
                    hashArquivo: enquanto.hashArquivo,
                });
                return Promise.reject(erro);
            }
        }

        if (acumularRetornos) {
            return {
                valorRetornado: retornos,
                tipo: 'vetor',
            };
        }

        return retornoExecucao;
    }

    override async visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> {
        return this.logicaComumExecucaoEnquanto(declaracao, false);
    }

    protected async logicaComumExecucaoFazer(fazer: FazerInterface, acumularRetornos: boolean) {
        let retornoExecucao: ResultadoParcialInterpretadorInterface;
        const retornos = [];
        do {
            try {
                retornoExecucao = await this.executar(fazer.caminhoFazer);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                    if (acumularRetornos) {
                        return {
                            valorRetornado: retornos,
                            tipo: 'vetor',
                        };
                    }

                    return null;
                }

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }

                if (acumularRetornos) {
                    retornos.push(this.resolverValor(retornoExecucao));
                }
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: fazer.linha,
                    hashArquivo: fazer.hashArquivo,
                });
                return Promise.reject(erro);
            }
        } while (
            (acumularRetornos ||
                !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra)) &&
            this.eVerdadeiro(await this.avaliar(fazer.condicaoEnquanto))
        );

        if (acumularRetornos) {
            return {
                valorRetornado: retornos,
                tipo: 'vetor',
            };
        }
    }

    override async visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        return this.logicaComumExecucaoFazer(declaracao, false);
    }

    protected async logicaComumExecucaoPara(
        para: ParaInterface,
        acumularRetornos: boolean
    ): Promise<any> {
        const declaracaoInicializador = Array.isArray(para.inicializador)
            ? para.inicializador[0]
            : para.inicializador;

        if (declaracaoInicializador !== null) {
            await this.avaliar(declaracaoInicializador);
        }

        let retornoExecucao: ResultadoParcialInterpretadorInterface;
        const retornos = [];
        while (
            acumularRetornos ||
            !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra)
        ) {
            if (para.condicao !== null && !this.eVerdadeiro(await this.avaliar(para.condicao))) {
                break;
            }

            retornoExecucao = await this.executar(para.corpo);
            if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                if (acumularRetornos) {
                    return {
                        valorRetornado: retornos,
                        tipo: 'vetor',
                    };
                }

                return null;
            }

            if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                retornoExecucao = null;
            }

            if (acumularRetornos) {
                retornos.push(this.resolverValor(retornoExecucao));
            }

            if (para.incrementar !== null) {
                await this.avaliar(para.incrementar);
            }
        }

        if (acumularRetornos) {
            return {
                valorRetornado: retornos,
                tipo: 'vetor',
            };
        }

        return retornoExecucao;
    }

    override async visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        return this.logicaComumExecucaoPara(declaracao, false);
    }

    protected async logicaComumExecucaoParaCada(
        paraCada: ParaCadaInterface,
        acumularRetornos: boolean
    ): Promise<any> {
        let retornoExecucao: ResultadoParcialInterpretadorInterface;
        // Posição atual precisa ser reiniciada, pois pode estar dentro de outro
        // laço de repetição.
        paraCada.posicaoAtual = 0;
        const vetorOuDicionarioResolvido = await this.avaliar(paraCada.vetorOuDicionario);
        let valorVetorOuDicionarioResolvido: any = this.resolverValor(vetorOuDicionarioResolvido);

        // Se até aqui vetor resolvido é um dicionário, converte dicionário
        // para vetor de duplas.
        if (paraCada.vetorOuDicionario.tipo === 'dicionário') {
            valorVetorOuDicionarioResolvido = Object.entries(valorVetorOuDicionarioResolvido).map(
                (v) =>
                    new Dupla(
                        new Literal(paraCada.hashArquivo, paraCada.linha, v[0], 'texto'),
                        new Literal(
                            paraCada.hashArquivo,
                            paraCada.linha,
                            v[1] as any,
                            inferirTipoVariavel(v[1]) as any
                        )
                    )
            );
        }

        if (
            paraCada.vetorOuDicionario.tipo === 'texto' ||
            typeof valorVetorOuDicionarioResolvido === 'string'
        ) {
            valorVetorOuDicionarioResolvido = valorVetorOuDicionarioResolvido.split('');
        }

        if (!Array.isArray(valorVetorOuDicionarioResolvido)) {
            return Promise.reject(
                "Variável ou literal provida em instrução 'para cada' não é um vetor."
            );
        }

        const retornos = [];
        while (
            (acumularRetornos ||
                !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra)) &&
            paraCada.posicaoAtual < valorVetorOuDicionarioResolvido.length
        ) {
            try {
                if (paraCada.variavelIteracao instanceof Variavel) {
                    this.pilhaEscoposExecucao.definirVariavel(
                        paraCada.variavelIteracao.simbolo.lexema,
                        valorVetorOuDicionarioResolvido[paraCada.posicaoAtual]
                    );
                }

                if (paraCada.variavelIteracao instanceof Dupla) {
                    const valorComoDupla = valorVetorOuDicionarioResolvido[
                        paraCada.posicaoAtual
                    ] as Dupla;

                    const nomesVariaveis = await Promise.all([
                        this.avaliar(paraCada.variavelIteracao.primeiro),
                        this.avaliar(paraCada.variavelIteracao.segundo),
                    ]);

                    const valoresDupla = await Promise.all([
                        this.avaliar(valorComoDupla.primeiro),
                        this.avaliar(valorComoDupla.segundo),
                    ]);

                    // nomesVariaveis são strings (nomes das variáveis)
                    this.pilhaEscoposExecucao.definirVariavel(
                        String(nomesVariaveis[0]),
                        valoresDupla[0]
                    );

                    this.pilhaEscoposExecucao.definirVariavel(
                        String(nomesVariaveis[1]),
                        valoresDupla[1]
                    );
                }

                retornoExecucao = await this.executar(paraCada.corpo);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                    if (acumularRetornos) {
                        return {
                            valorRetornado: retornos,
                            tipo: 'vetor',
                        };
                    }

                    return null;
                }

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }

                if (acumularRetornos) {
                    retornos.push(this.resolverValor(retornoExecucao));
                }

                paraCada.posicaoAtual++;
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: paraCada.linha,
                    hashArquivo: paraCada.hashArquivo,
                });
                return Promise.reject(erro);
            }
        }

        if (acumularRetornos) {
            return {
                valorRetornado: retornos,
                tipo: 'vetor',
            };
        }

        return retornoExecucao;
    }

    async visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        return this.logicaComumExecucaoParaCada(declaracao, false);
    }

    override async visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<any> {
        const retornoInicializacao = await this.avaliar(declaracao.inicializacaoVariavel);
        const retornoInicializacaoResolvido = this.resolverValor(retornoInicializacao);
        this.pilhaEscoposExecucao.definirConstante(
            declaracao.simboloVariavel.lexema,
            retornoInicializacaoResolvido
        );
        await this.executar(declaracao.corpo);

        if (retornoInicializacaoResolvido instanceof ObjetoDeleguaClasse) {
            const metodoFinalizar =
                retornoInicializacaoResolvido.classe.encontrarMetodo('finalizar');
            if (metodoFinalizar) {
                const chamavel = metodoFinalizar.funcaoPorMetodoDeClasse(
                    retornoInicializacaoResolvido
                );
                chamavel.chamar(this, []);
            }
        }

        return null;
    }

    override async visitarExpressaoAcessoIndiceVariavel(
        expressao: AcessoIndiceVariavel
    ): Promise<any> {
        const promises = await Promise.all([
            this.avaliar(expressao.entidadeChamada),
            this.avaliar(expressao.indice),
        ]);

        const variavelObjeto: VariavelInterface = promises[0];
        const indice = promises[1];

        const objeto = this.resolverValor(variavelObjeto);
        let valorIndice = this.resolverValor(indice);

        if (Array.isArray(objeto)) {
            if (!Number.isInteger(valorIndice)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Somente inteiros podem ser usados para indexar um vetor.',
                        expressao.linha
                    )
                );
            }

            if (valorIndice < 0 && objeto.length !== 0) {
                valorIndice += objeto.length;
            }

            if (valorIndice >= objeto.length || valorIndice < 0) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Índice do vetor fora do intervalo.',
                        expressao.linha
                    )
                );
            }

            return objeto[valorIndice];
        }

        if (objeto instanceof TuplaN || objeto.constructor.name === 'TuplaN') {
            if (!Number.isInteger(valorIndice)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Somente inteiros podem ser usados para indexar uma tupla.',
                        expressao.linha
                    )
                );
            }

            if (valorIndice < 0 && objeto.elementos.length !== 0) {
                valorIndice += objeto.elementos.length;
            }

            if (valorIndice >= objeto.elementos.length || valorIndice < 0) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Índice da tupla fora de intervalo.',
                        expressao.linha
                    )
                );
            }

            const elemento = objeto.elementos[valorIndice];
            if (elemento && elemento.constructor && elemento.constructor.name === 'Literal') {
                return elemento.valor;
            }

            return elemento;
        }

        if (objeto instanceof Vetor) {
            return objeto.valores[valorIndice];
        }

        if (
            objeto.constructor === Object ||
            objeto instanceof ObjetoDeleguaClasse ||
            objeto instanceof DeleguaFuncao ||
            objeto instanceof DescritorTipoClasse ||
            objeto instanceof DeleguaModulo
        ) {
            if (objeto[valorIndice] === 0) return 0;
            return objeto[valorIndice] || null;
        }

        if (typeof objeto === tipoDeDadosPrimitivos.TEXTO) {
            if (!Number.isInteger(valorIndice)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Somente inteiros podem ser usados para indexar um vetor.',
                        expressao.linha
                    )
                );
            }

            if (valorIndice < 0 && objeto.length !== 0) {
                valorIndice += objeto.length;
            }

            if (valorIndice >= objeto.length || valorIndice < 0) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Índice fora do tamanho.',
                        expressao.linha
                    )
                );
            }

            return objeto.charAt(valorIndice);
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: this.hashArquivoDeclaracaoAtual,
                    linha: this.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Somente listas, dicionários, classes e objetos podem ter seus valores indexados.',
                expressao.linha
            )
        );
    }

    override async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> {
        const nomeObjeto = this.resolverNomeObjectoAcessado(expressao.objeto);

        let variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);

        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor === RetornoQuebra) {
            variavelObjeto = (variavelObjeto as any).valor;
        }

        const objeto = this.resolverValor(variavelObjeto);

        if (objeto.constructor && objeto.constructor === ObjetoDeleguaClasse) {
            try {
                return (objeto as ObjetoDeleguaClasse).obterMetodo(expressao.nomeMetodo);
            } catch (e) {
                const nomeClasse = (objeto as ObjetoDeleguaClasse).classe.simboloOriginal.lexema;
                const funcaoExt = this.encontrarMetodoExtensao(
                    [nomeClasse, 'objeto'],
                    expressao.nomeMetodo,
                    this.hashArquivoDeclaracaoAtual
                );
                if (funcaoExt) return funcaoExt.funcaoPorExtensao(objeto);
                throw e;
            }
        }

        if (objeto instanceof TuplaN || objeto.constructor.name === 'TuplaN') {
            const metodoDePrimitivaTupla = primitivasTupla[expressao.nomeMetodo];
            if (metodoDePrimitivaTupla) {
                return new MetodoPrimitiva(
                    nomeObjeto,
                    objeto,
                    metodoDePrimitivaTupla.implementacao,
                    expressao.nomeMetodo,
                    'tupla'
                );
            }
        }

        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            if (expressao.nomeMetodo in primitivasDicionario) {
                const metodoDePrimitivaDicionario: Function =
                    primitivasDicionario[expressao.nomeMetodo].implementacao;
                return new MetodoPrimitiva(
                    nomeObjeto,
                    objeto,
                    metodoDePrimitivaDicionario,
                    expressao.nomeMetodo,
                    'dicionário'
                );
            }

            return objeto[expressao.nomeMetodo] || null;
        }

        // Casos em que o objeto possui algum outro tipo que não o de objeto simples.
        // Normalmente executam quando uma biblioteca é importada, e estamos tentando
        // obter alguma propriedade ou método desse objeto.

        // Caso 1: Função tradicional do JavaScript.
        if (typeof objeto[expressao.nomeMetodo] === tipoDeDadosPrimitivos.FUNCAO) {
            return objeto[expressao.nomeMetodo];
        }

        // Caso 2: Objeto tradicional do JavaScript.
        if (typeof objeto[expressao.nomeMetodo] === tipoDeDadosPrimitivos.OBJETO) {
            return objeto[expressao.nomeMetodo];
        }

        // A partir daqui, presume-se que o objeto é uma das estruturas
        // de Delégua.
        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.nomeMetodo] || null;
        }

        let tipoObjeto = variavelObjeto.tipo;
        if (tipoObjeto === null || tipoObjeto === undefined) {
            tipoObjeto = inferirTipoVariavel(objeto as any);
        }

        // Como internamente um dicionário de Delégua é simplesmente um objeto de
        // JavaScript, as primitivas de dicionário, especificamente, são tratadas
        // mais acima.
        switch (tipoObjeto) {
            case tipoDeDadosDelegua.INTEIRO:
            case tipoDeDadosDelegua.NUMERO:
            case tipoDeDadosDelegua.NÚMERO:
                if (expressao.nomeMetodo in primitivasNumero) {
                    const metodoDePrimitivaNumero: Function =
                        primitivasNumero[expressao.nomeMetodo].implementacao;
                    if (metodoDePrimitivaNumero) {
                        return new MetodoPrimitiva(
                            nomeObjeto,
                            objeto,
                            metodoDePrimitivaNumero,
                            expressao.nomeMetodo,
                            tipoObjeto
                        );
                    }
                } else {
                    const funcaoExt = this.encontrarMetodoExtensao(
                        ['número', 'objeto'],
                        expressao.nomeMetodo,
                        this.hashArquivoDeclaracaoAtual
                    );
                    if (funcaoExt) return funcaoExt.funcaoPorExtensao(objeto);
                }
                break;
            case tipoDeDadosDelegua.TEXTO:
                if (expressao.nomeMetodo in primitivasTexto) {
                    const metodoDePrimitivaTexto: Function =
                        primitivasTexto[expressao.nomeMetodo].implementacao;
                    if (metodoDePrimitivaTexto) {
                        return new MetodoPrimitiva(
                            nomeObjeto,
                            objeto,
                            metodoDePrimitivaTexto,
                            expressao.nomeMetodo,
                            'texto'
                        );
                    }
                } else {
                    const funcaoExt = this.encontrarMetodoExtensao(
                        ['texto', 'objeto'],
                        expressao.nomeMetodo,
                        this.hashArquivoDeclaracaoAtual
                    );
                    if (funcaoExt) return funcaoExt.funcaoPorExtensao(objeto);
                }
                break;
            case tipoDeDadosDelegua.VETOR:
            case tipoDeDadosDelegua.VETOR_INTEIRO:
            case tipoDeDadosDelegua.VETOR_LOGICO:
            case tipoDeDadosDelegua.VETOR_LÓGICO:
            case tipoDeDadosDelegua.VETOR_NUMERO:
            case tipoDeDadosDelegua.VETOR_NÚMERO:
            case tipoDeDadosDelegua.VETOR_QUALQUER:
            case tipoDeDadosDelegua.VETOR_TEXTO:
                if (expressao.nomeMetodo in primitivasVetor) {
                    const metodoDePrimitivaVetor: Function =
                        primitivasVetor[expressao.nomeMetodo].implementacao;
                    if (metodoDePrimitivaVetor) {
                        return new MetodoPrimitiva(
                            nomeObjeto,
                            objeto,
                            metodoDePrimitivaVetor,
                            expressao.nomeMetodo,
                            tipoObjeto
                        );
                    }
                } else {
                    const funcaoExt = this.encontrarMetodoExtensao(
                        ['vetor', 'objeto'],
                        expressao.nomeMetodo,
                        this.hashArquivoDeclaracaoAtual
                    );
                    if (funcaoExt) return funcaoExt.funcaoPorExtensao(objeto);
                }
                break;
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: this.hashArquivoDeclaracaoAtual,
                    linha: this.linhaDeclaracaoAtual,
                } as SimboloInterface,
                `Método para objeto ou primitiva não encontrado: ${expressao.nomeMetodo}.`,
                expressao.linha
            )
        );
    }

    /**
     * Casos que ocorrem aqui:
     *
     * - Quando o método ou propriedade é ou 'qualquer', ou vetor
     *   de 'qualquer' ('qualquer[]'), e uma primitiva é usada.
     * - Quando o objeto é uma classe definida em código.
     * @param {AcessoMetodoOuPropriedade} expressao A expressão de acesso a método ou propriedade.
     * @returns A primitiva encontrada.
     */
    override async visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<any> {
        const nomeObjeto = this.resolverNomeObjectoAcessado(expressao.objeto);
        let variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);

        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor === RetornoQuebra) {
            const retornoQuebra = variavelObjeto as RetornoQuebra;
            variavelObjeto = retornoQuebra.valor;
        }

        const objeto = this.resolverValor(variavelObjeto, true);

        let descritorTipoClasse: DescritorTipoClasse | null = null;
        if (objeto instanceof DescritorTipoClasse) {
            descritorTipoClasse = objeto as DescritorTipoClasse;
        } else if (expressao.objeto instanceof Variavel) {
            try {
                const variavelClasse = this.procurarVariavel(
                    (expressao.objeto as Variavel).simbolo
                );
                const valorClasse = this.resolverValor(variavelClasse, true);
                if (valorClasse instanceof DescritorTipoClasse) {
                    descritorTipoClasse = valorClasse as DescritorTipoClasse;
                }
            } catch {
                // Ignora e continua fluxo padrão de resolução abaixo.
            }
        }

        if (descritorTipoClasse) {
            return await descritorTipoClasse.obterEstatico(expressao.simbolo.lexema, this);
        }

        if (objeto.constructor === ObjetoDeleguaClasse) {
            try {
                return await (objeto as ObjetoDeleguaClasse).obter(expressao.simbolo, this);
            } catch {
                const nomeClasse = (objeto as ObjetoDeleguaClasse).classe.simboloOriginal.lexema;
                const funcaoExt = this.encontrarMetodoExtensao(
                    [nomeClasse, 'objeto'],
                    expressao.simbolo.lexema,
                    this.hashArquivoDeclaracaoAtual
                );
                if (funcaoExt) return funcaoExt.funcaoPorExtensao(objeto);
                throw new ErroEmTempoDeExecucao(
                    expressao.simbolo,
                    `Método ou propriedade '${expressao.simbolo.lexema}' não encontrado em '${nomeClasse}'.`,
                    expressao.linha
                );
            }
        }

        if (objeto instanceof TuplaN || objeto.constructor.name === 'TuplaN') {
            const metodoDePrimitivaTupla = primitivasTupla[expressao.simbolo.lexema];
            if (metodoDePrimitivaTupla) {
                return new MetodoPrimitiva(
                    nomeObjeto,
                    objeto,
                    metodoDePrimitivaTupla.implementacao,
                    expressao.simbolo.lexema,
                    'tupla'
                );
            }
        }

        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            if (expressao.simbolo.lexema in primitivasDicionario) {
                const metodoDePrimitivaDicionario: Function =
                    primitivasDicionario[expressao.simbolo.lexema].implementacao;
                return new MetodoPrimitiva(
                    nomeObjeto,
                    objeto,
                    metodoDePrimitivaDicionario,
                    expressao.simbolo.lexema,
                    'dicionário'
                );
            }

            return objeto[expressao.simbolo.lexema];
        }

        // String do JavaScript, ou seja, primitiva de texto.
        if (objeto.constructor === String) {
            if (!(expressao.simbolo.lexema in primitivasTexto)) {
                const funcaoExt = this.encontrarMetodoExtensao(
                    ['texto', 'objeto'],
                    expressao.simbolo.lexema,
                    this.hashArquivoDeclaracaoAtual
                );
                if (funcaoExt) return funcaoExt.funcaoPorExtensao(objeto);
                throw new ErroEmTempoDeExecucao(
                    expressao.simbolo,
                    `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo texto.`
                );
            }

            const metodoDePrimitivaTexto: Function =
                primitivasTexto[expressao.simbolo.lexema].implementacao;
            return new MetodoPrimitiva(
                nomeObjeto,
                objeto,
                metodoDePrimitivaTexto,
                expressao.simbolo.lexema,
                'texto'
            );
        }

        // A partir daqui, presume-se que o objeto é uma das estruturas
        // de Delégua.
        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.simbolo.lexema] || null;
        }

        let tipoObjeto = variavelObjeto.tipo;
        if (tipoObjeto === null || tipoObjeto === undefined) {
            tipoObjeto = inferirTipoVariavel(objeto as any);
        }

        // Como internamente um dicionário de Delégua é simplesmente um objeto de
        // JavaScript, as primitivas de dicionário, especificamente, são tratadas
        // mais acima.
        switch (tipoObjeto) {
            case tipoDeDadosDelegua.INTEIRO:
            case tipoDeDadosDelegua.NUMERO:
            case tipoDeDadosDelegua.NÚMERO: {
                if (!(expressao.simbolo.lexema in primitivasNumero)) {
                    const funcaoExt = this.encontrarMetodoExtensao(
                        ['número', 'objeto'],
                        expressao.simbolo.lexema,
                        this.hashArquivoDeclaracaoAtual
                    );
                    if (funcaoExt) return funcaoExt.funcaoPorExtensao(objeto);
                    throw new ErroEmTempoDeExecucao(
                        expressao.simbolo,
                        `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo ${tipoObjeto}.`
                    );
                }

                const metodoDePrimitivaNumero: Function =
                    primitivasNumero[expressao.simbolo.lexema].implementacao;
                if (metodoDePrimitivaNumero) {
                    return new MetodoPrimitiva(
                        nomeObjeto,
                        objeto,
                        metodoDePrimitivaNumero,
                        expressao.simbolo.lexema,
                        'número'
                    );
                }
                break;
            }
            case tipoDeDadosDelegua.TEXTO: {
                if (!(expressao.simbolo.lexema in primitivasTexto)) {
                    const funcaoExt = this.encontrarMetodoExtensao(
                        ['texto', 'objeto'],
                        expressao.simbolo.lexema,
                        this.hashArquivoDeclaracaoAtual
                    );
                    if (funcaoExt) return funcaoExt.funcaoPorExtensao(objeto);
                    throw new ErroEmTempoDeExecucao(
                        expressao.simbolo,
                        `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo ${tipoObjeto}.`
                    );
                }

                const metodoDePrimitivaTexto: Function =
                    primitivasTexto[expressao.simbolo.lexema].implementacao;
                if (metodoDePrimitivaTexto) {
                    return new MetodoPrimitiva(
                        nomeObjeto,
                        objeto,
                        metodoDePrimitivaTexto,
                        expressao.simbolo.lexema,
                        'texto'
                    );
                }
                break;
            }
            case tipoDeDadosDelegua.VETOR:
            case tipoDeDadosDelegua.VETOR_INTEIRO:
            case tipoDeDadosDelegua.VETOR_LOGICO:
            case tipoDeDadosDelegua.VETOR_LÓGICO:
            case tipoDeDadosDelegua.VETOR_NUMERO:
            case tipoDeDadosDelegua.VETOR_NÚMERO:
            case tipoDeDadosDelegua.VETOR_QUALQUER:
            case tipoDeDadosDelegua.VETOR_TEXTO: {
                if (!(expressao.simbolo.lexema in primitivasVetor)) {
                    const funcaoExt = this.encontrarMetodoExtensao(
                        ['vetor', 'objeto'],
                        expressao.simbolo.lexema,
                        this.hashArquivoDeclaracaoAtual
                    );
                    if (funcaoExt) return funcaoExt.funcaoPorExtensao(objeto);
                    throw new ErroEmTempoDeExecucao(
                        expressao.simbolo,
                        `Método de primitiva '${expressao.simbolo.lexema}' não existe para o tipo ${tipoObjeto}.`
                    );
                }

                const metodoDePrimitivaVetor: Function =
                    primitivasVetor[expressao.simbolo.lexema].implementacao;
                if (metodoDePrimitivaVetor) {
                    return new MetodoPrimitiva(
                        nomeObjeto,
                        objeto,
                        metodoDePrimitivaVetor,
                        expressao.simbolo.lexema,
                        tipoObjeto
                    );
                }
                break;
            }
        }

        // Objeto de uma classe JavaScript regular (ou seja, com construtor e propriedades)
        // que possua a propriedade.
        // Exemplos: classes de LinConEs, como `RetornoComando`, ou bibliotecas globais com objetos próprios.
        if (objeto.hasOwnProperty && objeto.hasOwnProperty(expressao.simbolo.lexema)) {
            return objeto[expressao.simbolo.lexema];
        }

        // Último caso: objeto simples, sem construtor, sem protótipo. Exemplo: {'a': 1, 'b': 2}
        if (typeof objeto[expressao.simbolo.lexema] !== 'undefined') {
            return objeto[expressao.simbolo.lexema];
        }

        // Último recurso: extensões em 'objeto' (base universal).
        const funcaoExtObjeto = this.encontrarMetodoExtensao(
            ['objeto'],
            expressao.simbolo.lexema,
            this.hashArquivoDeclaracaoAtual
        );
        if (funcaoExtObjeto) return funcaoExtObjeto.funcaoPorExtensao(objeto);

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                `Método ou propriedade para objeto ou primitiva não encontrado: ${expressao.simbolo.lexema}.`,
                expressao.linha
            )
        );
    }

    override async visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> {
        const nomeObjeto = this.resolverNomeObjectoAcessado(expressao.objeto);
        let variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);

        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor === RetornoQuebra) {
            variavelObjeto = (variavelObjeto as RetornoQuebra).valor;
        }

        const objeto = this.resolverValor(variavelObjeto);

        // Outro caso que `instanceof` simplesmente não funciona para casos em Liquido,
        // então testamos também o nome do construtor.
        if (objeto.constructor === ObjetoDeleguaClasse) {
            return (objeto as ObjetoDeleguaClasse).obterMetodo(expressao.nomePropriedade) || null;
        }

        if (objeto instanceof TuplaN || objeto.constructor.name === 'TuplaN') {
            const metodoPrimitivaTupla = primitivasTupla[expressao.nomePropriedade];
            if (metodoPrimitivaTupla) {
                return new MetodoPrimitiva(
                    nomeObjeto,
                    objeto,
                    metodoPrimitivaTupla.implementacao,
                    expressao.nomePropriedade,
                    'tupla'
                );
            }
        }

        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            if (expressao.nomePropriedade in primitivasDicionario) {
                const metodoDePrimitivaDicionario: Function =
                    primitivasDicionario[expressao.nomePropriedade].implementacao;
                return new MetodoPrimitiva(
                    nomeObjeto,
                    objeto,
                    metodoDePrimitivaDicionario,
                    expressao.nomePropriedade,
                    'dicionário'
                );
            }

            return objeto[expressao.nomePropriedade] || null;
        }

        // Casos em que o objeto possui algum outro tipo que não o de objeto simples.
        // Normalmente executam quando uma biblioteca é importada, e estamos tentando
        // obter alguma propriedade ou método desse objeto.

        // Caso 1: Função tradicional do JavaScript.
        if (typeof objeto[expressao.nomePropriedade] === tipoDeDadosPrimitivos.FUNCAO) {
            return objeto[expressao.nomePropriedade];
        }

        // Caso 2: Objeto tradicional do JavaScript.
        if (typeof objeto[expressao.nomePropriedade] === tipoDeDadosPrimitivos.OBJETO) {
            return objeto[expressao.nomePropriedade];
        }

        // A partir daqui, presume-se que o objeto é uma das estruturas
        // de Delégua.
        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.nomePropriedade] || null;
        }

        let tipoObjeto = variavelObjeto.tipo;
        if (tipoObjeto === null || tipoObjeto === undefined) {
            tipoObjeto = inferirTipoVariavel(objeto as any);
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                `Propriedade para objeto ou primitiva não encontrado: ${expressao.nomePropriedade}.`,
                expressao.linha
            )
        );
    }

    async visitarExpressaoAjuda(expressao: AjudaComoConstruto): Promise<any> {
        if (expressao.funcao && expressao.valor && !(expressao.valor instanceof Leia)) {
            try {
                const resultado = await this.avaliar(expressao.valor);
                const valorAvaliado = this.resolverValor(resultado);
                if (
                    valorAvaliado instanceof DeleguaFuncao ||
                    valorAvaliado instanceof ObjetoDeleguaClasse ||
                    valorAvaliado instanceof DescritorTipoClasse
                ) {
                    return pontoEntradaAjuda(expressao.funcao, valorAvaliado);
                }
            } catch {
                // Se a avaliação falhar, usa o comportamento padrão
            }
        }
        return pontoEntradaAjuda(expressao.funcao, expressao.valor);
    }

    override async visitarExpressaoAtribuicaoPorIndice(
        expressao: AtribuicaoPorIndice
    ): Promise<any> {
        const promises = await Promise.all([
            this.avaliar(expressao.objeto),
            this.avaliar(expressao.indice),
            this.avaliar(expressao.valor),
        ]);

        let objeto = promises[0];
        let indice = promises[1];
        const valor = promises[2];

        if (objeto.tipo === tipoDeDadosDelegua.TUPLA) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    (expressao.objeto as Variavel).simbolo,
                    'Não é possível modificar uma tupla. As tuplas são estruturas de dados imutáveis.',
                    expressao.linha
                )
            );
        }

        objeto = this.resolverValor(objeto);
        indice = this.resolverValor(indice);

        // Se o valor é uma referência ao montão, e o índice que a recebe é
        // de uma variável/constante que vive num escopo superior, a referência
        // precisa ser transferida para o escopo correspondente.
        if (valor instanceof ReferenciaMontao) {
            // TODO: Terminar
            const nomeVariavel = (expressao.objeto as any).simbolo.lexema;
            if (this.pilhaEscoposExecucao.obterVariavelEm(1, nomeVariavel) === undefined) {
                this.pilhaEscoposExecucao.migrarReferenciaMontaoParaEscopoDeVariavel(
                    nomeVariavel,
                    valor.endereco
                );
            }
        }

        if (Array.isArray(objeto)) {
            if (indice < 0 && objeto.length !== 0) {
                while (indice < 0) {
                    indice += objeto.length;
                }
            }

            while (objeto.length < indice) {
                objeto.push(null);
            }

            objeto[indice] = valor;
            // this.pilhaEscoposExecucao.atribuirVariavel((expressao.objeto as any).simbolo, objeto);
        } else if (
            (objeto && objeto.constructor === Object) ||
            objeto instanceof ObjetoDeleguaClasse ||
            objeto instanceof DeleguaFuncao ||
            objeto instanceof DescritorTipoClasse ||
            objeto instanceof DeleguaModulo
        ) {
            objeto[indice] = valor;
        } else {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    (expressao.objeto as any).nome,
                    'Somente listas, dicionários, classes e objetos podem ser mudados por índice.',
                    expressao.linha
                )
            );
        }
    }

    /**
     * Em Delégua e Pituguês, comentários não são importantes para a interpretação.
     * @param expressao Uma `Promise` sempre resolvida.
     */
    override async visitarExpressaoComentario(expressao: ComentarioComoConstruto): Promise<any> {
        return Promise.resolve();
    }

    /**
     * Execução de uma expressão de atribuição.
     * @param expressao A expressão.
     * @returns O valor atribuído.
     */
    override async visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        let valor = await this.avaliar(expressao.valor);

        if (valor && valor.hasOwnProperty('valorRetornado')) {
            valor = valor.valorRetornado;
        }

        const valorResolvido = this.resolverValor(valor);
        let indice: any = null;

        if (expressao.indice) {
            indice = await this.avaliar(expressao.indice);
        }

        switch (expressao.alvo.constructor) {
            case Variavel:
                const alvoVariavel = expressao.alvo as Variavel;
                const variavelResolvida = this.pilhaEscoposExecucao.obterValorVariavel(
                    alvoVariavel.simbolo
                );
                if (variavelResolvida.valor instanceof ReferenciaMontao) {
                    const referenciaMontao = this.montao.obterReferencia(
                        this.hashArquivoDeclaracaoAtual,
                        this.linhaDeclaracaoAtual,
                        variavelResolvida.valor.endereco
                    );

                    referenciaMontao[indice] = valorResolvido;
                } else {
                    this.pilhaEscoposExecucao.atribuirVariavel(
                        alvoVariavel.simbolo,
                        valorResolvido,
                        indice
                    );
                }

                break;
            case AcessoMetodoOuPropriedade:
                // Nunca será método aqui: apenas propriedade.
                const alvoPropriedade = expressao.alvo as AcessoMetodoOuPropriedade;
                const variavelObjeto = await this.avaliar(alvoPropriedade.objeto);
                const objeto = this.resolverValor(variavelObjeto);

                const valor = await this.avaliar(expressao.valor);
                if (objeto.constructor === ObjetoDeleguaClasse) {
                    const objetoDeleguaClasse = objeto as ObjetoDeleguaClasse;
                    await objetoDeleguaClasse.definir(alvoPropriedade.simbolo, valor, this);
                } else {
                    // Se cair aqui, provavelmente `objeto.constructor.name` é 'Object'.
                    objeto[alvoPropriedade.simbolo.lexema] = valor;
                }

                break;
            default:
                throw new ErroEmTempoDeExecucao(
                    null,
                    `Atribuição com caso faltante: ${JSON.stringify(expressao)}.`
                );
        }

        return valorResolvido;
    }

    async visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any> {
        const variavelObjeto = await this.avaliar(expressao.objeto);
        const objeto = this.resolverValor(variavelObjeto);

        let descritorTipoClasse: DescritorTipoClasse | null = null;
        if (objeto instanceof DescritorTipoClasse) {
            descritorTipoClasse = objeto as DescritorTipoClasse;
        } else if (expressao.objeto instanceof Variavel) {
            try {
                const variavelClasse = this.procurarVariavel(
                    (expressao.objeto as Variavel).simbolo
                );
                const valorClasse = this.resolverValor(variavelClasse);
                if (valorClasse instanceof DescritorTipoClasse) {
                    descritorTipoClasse = valorClasse as DescritorTipoClasse;
                }
            } catch {
                // Ignora e continua fluxo padrão de definição abaixo.
            }
        }

        if (descritorTipoClasse) {
            const valor = await this.avaliar(expressao.valor);
            const valorResolvido = this.resolverValor(valor);
            await descritorTipoClasse.definirEstatico(expressao.nome.lexema, valorResolvido, this);
            return valorResolvido;
        }

        if (objeto.constructor !== ObjetoDeleguaClasse && objeto.constructor !== Object) {
            return Promise.reject(
                new ErroEmTempoDeExecucao(
                    expressao.nome,
                    'Somente instâncias e dicionários podem possuir campos.',
                    expressao.linha
                )
            );
        }

        const valor = await this.avaliar(expressao.valor);
        const valorResolvido = this.resolverValor(valor);
        if (objeto.constructor === ObjetoDeleguaClasse) {
            await objeto.definir(expressao.nome, valorResolvido, this);
            return valorResolvido;
        }

        if (objeto.constructor === Object) {
            objeto[expressao.nome.lexema] = valorResolvido;
        }
    }

    /**
     * Instâncias de classes em Delégua são passadas por referência, portanto, são
     * armazenadas no montão.
     */
    override async visitarExpressaoDeChamada(expressao: Chamada): Promise<any> {
        const resultado = await super.visitarExpressaoDeChamada(expressao);
        if (resultado instanceof ObjetoDeleguaClasse) {
            const enderecoMontao = this.montao.adicionarReferencia(resultado);
            this.pilhaEscoposExecucao.registrarReferenciaMontao(enderecoMontao);
            return new ReferenciaMontao(enderecoMontao);
        }
        return resultado;
    }

    /**
     * Dicionários em Delégua são passados por referência, portanto, são
     * armazenados no montão.
     */
    override async visitarExpressaoDicionario(expressao: Dicionario): Promise<any> {
        // Delega ao interpretador base para processar o dicionário (incluindo spread)
        const dicionario = await super.visitarExpressaoDicionario(expressao);

        // Adiciona referência no montão (comportamento específico deste interpretador)
        const enderecoDicionarioMontao = this.montao.adicionarReferencia(dicionario);
        this.pilhaEscoposExecucao.registrarReferenciaMontao(enderecoDicionarioMontao);
        return new ReferenciaMontao(enderecoDicionarioMontao);
    }

    async visitarExpressaoElvis(expressao: Elvis): Promise<any> {
        const esquerda: VariavelInterface | any = await this.avaliar(expressao.esquerda);
        const direita: VariavelInterface | any = await this.avaliar(expressao.direita);
        const valorEsquerdo: any = this.resolverValor(esquerda);
        const valorDireito: any = this.resolverValor(direita);

        if (valorEsquerdo === null || valorEsquerdo === undefined) {
            return valorDireito;
        }

        return valorEsquerdo;
    }

    visitarExpressaoEnquanto(expressao: EnquantoComoConstruto): Promise<any> | void {
        return this.logicaComumExecucaoEnquanto(expressao, true);
    }

    visitarExpressaoFazer(expressao: FazerComoConstruto): Promise<any> | void {
        return this.logicaComumExecucaoFazer(expressao, true);
    }

    visitarExpressaoImportar(expressao: ImportarComoConstruto): Promise<any> | void {
        throw new Error('Importações não são suportadas neste interpretador.');
    }

    async visitarExpressaoListaCompreensao(listaCompreensao: ListaCompreensao): Promise<any> {
        const vetorVariavelIteracao = await this.avaliar(
            listaCompreensao.referenciaVariavelIteracao
        );
        let valorVetorVariavelIteracao: any = this.resolverValor(vetorVariavelIteracao);

        if (!Array.isArray(valorVetorVariavelIteracao)) {
            return Promise.reject(
                "Variável ou literal provida em instrução 'para cada' não é um vetor."
            );
        }

        const resultadoCompreensao = await this.avaliar(listaCompreensao.paraCada);
        const resultadoCompreensaoResolvido = resultadoCompreensao.valorRetornado
            .filter((r) => r !== null)
            .map((r) => this.resolverValor(r));

        return resultadoCompreensaoResolvido;
    }

    visitarExpressaoPara(expressao: ParaComoConstruto): Promise<any> | void {
        return this.logicaComumExecucaoPara(expressao, true);
    }

    visitarExpressaoParaCada(expressao: ParaCadaComoConstruto): Promise<any> {
        return this.logicaComumExecucaoParaCada(expressao, true);
    }

    override async visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        let valor = null;
        if (declaracao.valor !== null && declaracao.valor !== undefined) {
            valor = await this.avaliar(declaracao.valor);
        }

        const retornoQuebra = new RetornoQuebra(valor, declaracao.tipo);

        // Se o retorno for uma função anônima ou referência ao montão, o escopo precisa ser preservado.
        // Como quebras matam o topo da pilha de escopos, precisamos dizer
        // para a finalização para copiar valores importantes para o escopo de baixo.
        if (retornoQuebra.valor) {
            const construtorRetorno = retornoQuebra.valor.constructor.name.replaceAll('_', '');
            if (['DeleguaFuncao', 'ReferenciaMontao'].includes(construtorRetorno)) {
                retornoQuebra.preservarEscopo = true; // TODO: Ver se é mesmo o caso de manter isso para referências ao montão.
            }
        }

        return retornoQuebra;
    }

    /**
     * Para Delégua e Pituguês, o separador é apenas um elemento de sintaxe.
     * Não há qualquer avaliação a ser feita.
     * @param expressao
     */
    override async visitarExpressaoSeparador(expressao: Separador): Promise<any> {
        return Promise.resolve(null);
    }

    async visitarExpressaoSeTernario(expressao: SeTernario): Promise<any> {
        const avaliacaoCondicao = await this.avaliar(expressao.condicao);
        const valorAvaliacaoCondicao = this.resolverValor(avaliacaoCondicao);
        if (valorAvaliacaoCondicao) {
            return this.avaliar(expressao.expressaoSe);
        }

        return this.avaliar(expressao.expressaoSenao);
    }

    override async visitarExpressaoTipoDe(expressao: TipoDe): Promise<string> {
        let valorTipoDe = expressao.valor;

        switch (valorTipoDe.constructor) {
            case AcessoIndiceVariavel:
            case Agrupamento:
            case Binario:
            case Chamada:
            case Dicionario:
            case Unario:
                valorTipoDe = await this.avaliar(valorTipoDe);
                if (valorTipoDe instanceof ReferenciaMontao) {
                    valorTipoDe = this.montao.obterReferencia(
                        this.hashArquivoDeclaracaoAtual,
                        this.linhaDeclaracaoAtual,
                        valorTipoDe.endereco
                    );
                }

                return valorTipoDe.tipo || inferirTipoVariavel(valorTipoDe);
            case AcessoMetodo:
                const acessoMetodo = valorTipoDe as AcessoMetodo;
                const tipoRetornoMetodoResolvido = acessoMetodo.tipoRetornoMetodo.replace(
                    '<T>',
                    acessoMetodo.objeto.tipo
                );
                return `método<${tipoRetornoMetodoResolvido}>`;
            case AcessoPropriedade:
                const acessoPropriedade = valorTipoDe as AcessoPropriedade;
                return acessoPropriedade.tipoRetornoPropriedade;
            case AcessoMetodoOuPropriedade:
                // TODO: Deve ser removido mais futuramente.
                // Apenas `AcessoMetodo` e `AcessoPropriedade` devem funcionar aqui.
                throw new ErroEmTempoDeExecucao(expressao.simbolo, 'Não deveria cair aqui.');
            case Escreva:
                return 'função<vazio>';
            case Leia:
                return 'função<texto>';
            case Literal:
                const tipoLiteral = valorTipoDe as Literal;
                return tipoLiteral.tipo;
            case TipoDe:
                const alvoTipoDe = await this.avaliar(valorTipoDe);
                return `tipo de<${alvoTipoDe}>`;
            case Variavel:
                return valorTipoDe.tipo;
            case Vetor:
                const vetor = valorTipoDe as Vetor;
                const apenasValores = vetor.valores.filter(
                    (v) => !['ComentarioComoConstruto', 'Separador'].includes(v.constructor.name)
                );
                return inferirTipoVariavel(apenasValores);
            default:
                return inferirTipoVariavel(valorTipoDe);
        }
    }

    override async visitarExpressaoUnaria(expressao: Unario): Promise<any> {
        // Tratamento especial para expressões unárias aplicadas a chamadas de método em literais numéricos.
        // Por exemplo: -5.absoluto() deve ser avaliado como (-5).absoluto(), não como -(5.absoluto())
        // Isso garante que o operador unário seja aplicado ao literal antes de chamar o método.
        if (
            (expressao.operador.tipo === tiposDeSimbolos.SUBTRACAO ||
                expressao.operador.tipo === tiposDeSimbolos.ADICAO) &&
            expressao.operando instanceof Chamada
        ) {
            const entidadeChamada = expressao.operando.entidadeChamada;

            // Verifica se é AcessoMetodo ou AcessoMetodoOuPropriedade
            if (
                entidadeChamada instanceof AcessoMetodo ||
                entidadeChamada instanceof AcessoMetodoOuPropriedade
            ) {
                const objetoAcesso = entidadeChamada.objeto;

                // Verifica se o objeto do método é um literal numérico
                if (objetoAcesso instanceof Literal && typeof objetoAcesso.valor === 'number') {
                    // Cria um novo literal com o sinal aplicado
                    const novoLiteral = new Literal(
                        objetoAcesso.hashArquivo,
                        objetoAcesso.linha,
                        expressao.operador.tipo === tiposDeSimbolos.SUBTRACAO
                            ? -objetoAcesso.valor
                            : +objetoAcesso.valor
                    );

                    // Cria um novo acesso com o literal modificado
                    let novoAcesso: AcessoMetodo | AcessoMetodoOuPropriedade;
                    if (entidadeChamada instanceof AcessoMetodo) {
                        novoAcesso = new AcessoMetodo(
                            entidadeChamada.hashArquivo,
                            novoLiteral,
                            entidadeChamada.nomeMetodo,
                            entidadeChamada.tipoRetornoMetodo
                        );
                    } else {
                        novoAcesso = new AcessoMetodoOuPropriedade(
                            entidadeChamada.hashArquivo,
                            novoLiteral,
                            entidadeChamada.simbolo
                        );
                    }

                    // Cria uma nova Chamada com o acesso modificado
                    const novaChamada = new Chamada(
                        expressao.operando.hashArquivo,
                        novoAcesso,
                        expressao.operando.argumentos
                    );

                    // Avalia a nova chamada
                    return await this.avaliar(novaChamada);
                }
            }
        }

        // Para outros casos, usa o comportamento padrão
        return await super.visitarExpressaoUnaria(expressao);
    }

    override async visitarExpressaoVetor(expressao: Vetor): Promise<any> {
        // Delega ao interpretador base para processar o vetor
        const vetor = await super.visitarExpressaoVetor(expressao);

        // Adiciona referência no montão (comportamento específico deste interpretador)
        const enderecoVetorMontao = this.montao.adicionarReferencia(vetor);
        this.pilhaEscoposExecucao.registrarReferenciaMontao(enderecoVetorMontao);
        return new ReferenciaMontao(enderecoVetorMontao);
    }

    /**
     * Executa o último escopo empilhado no topo na pilha de escopos do interpretador.
     * Esse método pega exceções, mas apenas as devolve.
     *
     * O tratamento das exceções é feito de acordo com o bloco chamador.
     * Por exemplo, em `tente ... pegue ... finalmente`, a exceção é capturada e tratada.
     * Em outros blocos, pode ser desejável ter o erro em tela.
     * @param manterAmbiente Se verdadeiro, ambiente do topo da pilha de escopo é copiado para o ambiente imediatamente abaixo.
     * @returns O resultado da execução do escopo, se houver.
     */
    override async executarUltimoEscopo(
        manterAmbiente = false
    ): Promise<ResultadoParcialInterpretadorInterface> {
        const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        let retornoExecucao: ResultadoParcialInterpretadorInterface;
        try {
            for (
                ;
                !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra) &&
                ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                const declaracaoAtual = ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual];
                this.linhaDeclaracaoAtual = declaracaoAtual.linha;
                this.hashArquivoDeclaracaoAtual = declaracaoAtual.hashArquivo;
                retornoExecucao = await this.executar(declaracaoAtual);
            }

            return retornoExecucao;
        } catch (erro: any) {
            const declaracaoAtual = ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual];
            if (!this.emDeclaracaoTente) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracaoAtual.linha,
                    hashArquivo: declaracaoAtual.hashArquivo,
                });
            } else {
                return Promise.reject(erro);
            }
        } finally {
            const escopoFinalizado = this.pilhaEscoposExecucao.removerUltimo();
            const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();

            if (
                manterAmbiente ||
                (retornoExecucao && retornoExecucao.valorRetornado.preservarEscopo === true)
            ) {
                escopoAnterior.espacoMemoria.valores = Object.assign(
                    escopoAnterior.espacoMemoria.valores,
                    ultimoEscopo.espacoMemoria.valores
                );

                escopoAnterior.espacoMemoria.enderecosMontao = new Set([
                    ...escopoAnterior.espacoMemoria.enderecosMontao,
                    ...ultimoEscopo.espacoMemoria.enderecosMontao,
                ]);
            } else {
                this.montao.excluirReferencias(...escopoFinalizado.espacoMemoria.enderecosMontao);
            }
        }
    }

    async visitarExpressaoTuplaN(expressao: TuplaN): Promise<any> {
        return super.visitarExpressaoTuplaN(expressao);
    }

    /**
     * Método que efetivamente inicia o processo de interpretação.
     * @param declaracoes Um vetor de declarações gerado pelo Avaliador Sintático.
     * @param manterAmbiente Se ambiente de execução (variáveis, classes, etc.) deve ser mantido. Normalmente usado
     *                       pelo modo REPL (LAIR).
     * @returns Um objeto com o resultado da interpretação.
     */
    override async interpretar(
        declaracoes: Declaracao[],
        manterAmbiente?: boolean
    ): Promise<RetornoInterpretadorInterface> {
        this.montao = new Montao();
        const resultados = await super.interpretar(declaracoes, manterAmbiente);
        if (resultados.resultado.length > 0) {
            const ultimoResultado = resultados.resultado[resultados.resultado.length - 1];

            if (
                ultimoResultado &&
                ultimoResultado.valorRetornado instanceof RetornoQuebra &&
                ultimoResultado.valorRetornado.valor instanceof ReferenciaMontao
            ) {
                const ultimaDeclaracao = declaracoes[declaracoes.length - 1];
                ultimoResultado.valorRetornado.valor = this.montao.obterReferencia(
                    ultimaDeclaracao.hashArquivo,
                    ultimaDeclaracao.linha,
                    ultimoResultado.valorRetornado.valor.endereco
                );
            }
        }

        return resultados;
    }
}
