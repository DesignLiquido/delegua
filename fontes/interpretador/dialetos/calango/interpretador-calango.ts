import { Construto, Atribuir, AcessoIndiceVariavel, AcessoElementoMatriz, AcessoMetodo, AcessoMetodoOuPropriedade, AcessoPropriedade, Agrupamento, ArgumentoReferenciaFuncao, AtribuicaoPorIndice, AtribuicaoPorIndicesMatriz, Binario, Chamada, DefinirValor, FuncaoConstruto, Variavel, Constante, Dicionario, ExpressaoRegular, FimPara, FormatacaoEscrita, Isto, Leia, Literal, Logico, ReferenciaFuncao, Super, Tupla, TipoDe, Unario, Vetor } from "../../../construtos";
import { Declaracao, Aleatorio, CabecalhoPrograma, Classe, Comentario, Const, ConstMultiplo, Expressao, FuncaoDeclaracao, Enquanto, Escolha, Escreva, EscrevaMesmaLinha, Fazer, Importar, InicioAlgoritmo, Para, ParaCada, Se, TendoComo, Tente, Var, VarMultiplo, Bloco, Continua, Falhar, Retorna, Sustar } from "../../../declaracoes";
import { EspacoVariaveis } from "../../../espaco-variaveis";
import { ErroEmTempoDeExecucao } from "../../../excecoes";
import { InterpretadorInterface, RetornoInterpretador } from "../../../interfaces";
import { ErroInterpretador } from "../../../interfaces/erros/erro-interpretador";
import { EscopoExecucao } from "../../../interfaces/escopo-execucao";
import { PilhaEscoposExecucaoInterface } from "../../../interfaces/pilha-escopos-execucao-interface";
import { ContinuarQuebra, Quebra, RetornoQuebra, SustarQuebra } from "../../../quebras";
import { ObjetoPadrao } from "../../estruturas";

export class InterpretadotCalango implements InterpretadorInterface {
    diretorioBase: any;

    funcaoDeRetorno: Function;
    funcaoDeRetornoMesmaLinha: Function = null;

    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    interfaceEntradaSaida: any;

    declaracoes: Declaracao[];
    erros: ErroInterpretador[];
    resultadoInterpretador: Array<string> = [];

    constructor(
        diretorioBase: string,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        this.diretorioBase = diretorioBase;
        
        this.funcaoDeRetorno = funcaoDeRetorno || console.log;
        this.funcaoDeRetornoMesmaLinha = funcaoDeRetornoMesmaLinha || process.stdout.write.bind(process.stdout);
    
        this.erros = [];
        this.declaracoes = [];
        this.resultadoInterpretador = [];
    }

    eVerdadeiro(objeto: any): boolean {
        if (objeto === null) return false;
        if (typeof objeto === 'boolean') return Boolean(objeto);
        if (objeto.hasOwnProperty('valor')) {
            return Boolean(objeto.valor);
        }

        return true;
    }

    async avaliar(expressao: Construto | Declaracao): Promise<any> {
        // Descomente o código abaixo quando precisar detectar expressões undefined ou nulas.
        // Por algum motivo o depurador do VSCode não funciona direito aqui
        // com breakpoint condicional.
        /* if (expressao === null || expressao === undefined) {
            console.log('Aqui');
        } */

        return await expressao.aceitar(this);
    }
    
    executarBloco(declaracoes: Declaracao[], ambiente?: EspacoVariaveis): Promise<any> {
        throw new Error("Método não implementado.");
    }
    
    paraTexto(objeto: any) {
        if (objeto === null || objeto === undefined) return 'nulo';
        if (typeof objeto === 'boolean') {
            return objeto ? 'verdadeiro' : 'falso';
        }

        if (objeto instanceof Date) {
            const formato = Intl.DateTimeFormat('pt', {
                dateStyle: 'full',
                timeStyle: 'full',
            });
            return formato.format(objeto);
        }

        if (Array.isArray(objeto)) return objeto;
        if (objeto.valor instanceof ObjetoPadrao) return objeto.valor.paraTexto();
        if (typeof objeto === 'object') return JSON.stringify(objeto);

        return objeto.toString();
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoClasse(declaracao: Classe): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoComentario(declaracao: Comentario): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoConst(declaracao: Const): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any> | void {
        throw new Error("Método não implementado.");
    }

    protected async avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string> {
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
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    async visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscreva(declaracao.argumentos);
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


    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoImportar(declaracao: Importar): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoPara(declaracao: Para): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> | void {
        throw new Error("Método não implementado.");
    }

    async visitarDeclaracaoSe(declaracao: Se): Promise<any> {
        if (this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
            return await this.executar(declaracao.caminhoEntao);
        }

        for (let i = 0; i < declaracao.caminhosSeSenao.length; i++) {
            const atual = declaracao.caminhosSeSenao[i];

            if (this.eVerdadeiro(await this.avaliar(atual.condicao))) {
                return await this.executar(atual.caminho);
            }
        }

        if (declaracao.caminhoSenao !== null) {
            return await this.executar(declaracao.caminhoSenao);
        }

        return null;
    }
    
    visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarDeclaracaoTente(declaracao: Tente): Promise<any> | void {
        throw new Error("Método não implementado.");
    }


    protected async avaliacaoDeclaracaoVar(declaracao: Var): Promise<any> {
        let valorOuOutraVariavel = null;
        if (declaracao.inicializador !== null) {
            valorOuOutraVariavel = await this.avaliar(declaracao.inicializador);
        }

        let valorFinal = null;
        if (valorOuOutraVariavel !== null && valorOuOutraVariavel !== undefined) {
            valorFinal = valorOuOutraVariavel.hasOwnProperty('valor')
                ? valorOuOutraVariavel.valor
                : valorOuOutraVariavel;
        }

        return valorFinal;
    }

    /**
     * Executa expressão de definição de variável.
     * @param declaracao A declaração Var
     * @returns Sempre retorna nulo.
     */
    async visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        const valorFinal = await this.avaliacaoDeclaracaoVar(declaracao);

        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, valorFinal, declaracao.tipo);

        return null;
    }
    
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAcessoMetodoOuPropriedade(expressao: AcessoMetodoOuPropriedade): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoArgumentoReferenciaFuncao(expressao: ArgumentoReferenciaFuncao): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: AtribuicaoPorIndicesMatriz): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoBinaria(expressao: Binario): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDeChamada(expressao: Chamada): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDeVariavel(expressao: Variavel | Constante): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoDicionario(expressao: Dicionario): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoFalhar(expressao: Falhar): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoFimPara(declaracao: FimPara): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoIsto(expressao: Isto): Promise<any> | void {
        throw new Error("Método não implementado.");
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        const mensagem = expressao.argumentos && expressao.argumentos[0] ? expressao.argumentos[0].valor : '> ';
        return new Promise((resolucao) =>
            this.interfaceEntradaSaida.question(mensagem, (resposta: any) => {
                resolucao(resposta);
            })
        );
    }
    
    visitarExpressaoLiteral(expressao: Literal): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoLogica(expressao: Logico): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoSuper(expressao: Super): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoTupla(expressao: Tupla): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoUnaria(expressao: Unario): Promise<any> | void {
        throw new Error("Método não implementado.");
    }
    visitarExpressaoVetor(expressao: Vetor): Promise<any> | void {
        throw new Error("Método não implementado.");
    }

    /**
     * Efetivamente executa uma declaração.
     * @param declaracao A declaração a ser executada.
     * @param mostrarResultado Se resultado deve ser mostrado ou não. Normalmente usado
     *                         pelo modo LAIR.
     */
    executar(declaracao: Declaracao/*, mostrarResultado: boolean*/) {
        const resultado: any = await declaracao.aceitar(this);
        /* console.log("Resultado aceitar: " + resultado, this); */
        return resultado;
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
    async executarUltimoEscopo(manterAmbiente = false): Promise<any> {
        const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        let retornoExecucao: any;
        try {
            for (
                ;
                !(retornoExecucao instanceof Quebra) && ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                retornoExecucao = await this.executar(ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]);
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
            this.pilhaEscoposExecucao.removerUltimo();
            const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();

            if (manterAmbiente || (retornoExecucao && retornoExecucao.preservarEscopo === true)) {
                escopoAnterior.ambiente.valores = Object.assign(
                    escopoAnterior.ambiente.valores,
                    ultimoEscopo.ambiente.valores
                );
            }
        }
    }    

    async interpretar(declaracoes: Declaracao[], manterAmbiente?: boolean): Promise<RetornoInterpretador> {
        this.erros = [];
        // this.emDeclaracaoTente = false;

        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        // const inicioInterpretacao: [number, number] = hrtime();
        try {
            const retornoOuErro = await this.executarUltimoEscopo(manterAmbiente);
            if (retornoOuErro instanceof ErroEmTempoDeExecucao) {
                this.erros.push(retornoOuErro);
            }
        } catch (erro: any) {
            // TODO: Estudar remoção do `catch`.
            throw new Error(
                `Não deveria estar caindo aqui. Há erros no interpretador que não estão tratados corretamente. Erro atual: ${JSON.stringify(erro)}.`
            );
        } finally {
            const retorno = {
                erros: this.erros,
                resultado: this.resultadoInterpretador,
            } as RetornoInterpretador;

            this.resultadoInterpretador = [];
            return retorno;
        }
    }
}