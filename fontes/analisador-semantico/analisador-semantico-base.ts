import {
    Atribuir,
    AcessoIndiceVariavel,
    AcessoElementoMatriz,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    ArgumentoReferenciaFuncao,
    Agrupamento,
    AtribuicaoPorIndice,
    AtribuicaoPorIndicesMatriz,
    Binario,
    Chamada,
    DefinirValor,
    FuncaoConstruto,
    Dicionario,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    Isto,
    Literal,
    Logico,
    Super,
    Tupla,
    TipoDe,
    Unario,
    Vetor,
    ReferenciaFuncao,
    Leia,
    ComentarioComoConstruto,
    Separador,
    Variavel,
    Constante,
    Construto,
    AcessoIntervaloVariavel,
    TuplaN
} from '../construtos';
import {
    Declaracao,
    TendoComo,
    InicioAlgoritmo,
    CabecalhoPrograma,
    Classe,
    Const,
    ConstMultiplo,
    Expressao,
    FuncaoDeclaracao,
    Enquanto,
    Escolha,
    Escreva,
    Fazer,
    Importar,
    Para,
    ParaCada,
    Se,
    Tente,
    Var,
    VarMultiplo,
    Bloco,
    Continua,
    EscrevaMesmaLinha,
    Falhar,
    Retorna,
    Sustar,
    Comentario,
    TextoDocumentacao,
} from '../declaracoes';
import {
    CorrecaoSugeridaInterface,
    DiagnosticoAnalisadorSemantico,
    DiagnosticoSeveridade,
    ParametroInterface,
    SimboloInterface,
} from '../interfaces';
import { AnalisadorSemanticoInterface } from '../interfaces/analisador-semantico-interface';
import { RetornoAnalisadorSemantico } from '../interfaces/retornos/retorno-analisador-semantico';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';
import { GerenciadorEscopos } from './gerenciador-escopos';

/**
 * Essa classe só existe para eliminar redundância entre todos os analisadores
 * semânticos. Por padrão, quando um método não é implementado, ao invés de dar erro,
 * simplesmente passa por ele (`return Promise.resolve()`).
 */
export abstract class AnalisadorSemanticoBase implements AnalisadorSemanticoInterface {
    gerenciadorEscopos: GerenciadorEscopos;

    protected diagnosticoJaExiste(simbolo: SimboloInterface, mensagem: string): boolean {
        return this.diagnosticos.some(
            d => d.linha === simbolo.linha &&
                d.mensagem === mensagem &&
                d.simbolo.lexema === simbolo.lexema
        );
    }

    erro(simbolo: SimboloInterface, mensagem: string): void {
        if (this.diagnosticoJaExiste(simbolo, mensagem)) {
            return;
        }

        this.diagnosticos.push({
            simbolo: simbolo,
            mensagem: mensagem,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
            severidade: DiagnosticoSeveridade.ERRO,
        });
    }

    aviso(simbolo: SimboloInterface, mensagem: string): void {
        if (this.diagnosticoJaExiste(simbolo, mensagem)) {
            return;
        }

        this.diagnosticos.push({
            simbolo: simbolo,
            mensagem: mensagem,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
            severidade: DiagnosticoSeveridade.AVISO,
        });
    }

    sugestao(
        simbolo: SimboloInterface,
        mensagem: string,
        correcoes: CorrecaoSugeridaInterface[]
    ): void {
        if (this.diagnosticoJaExiste(simbolo, mensagem)) {
            return;
        }

        this.diagnosticos.push({
            simbolo: simbolo,
            mensagem: mensagem,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
            severidade: DiagnosticoSeveridade.SUGESTAO,
            colunaInicio: correcoes[0]?.colunaInicio,
            colunaFim: correcoes[0]?.colunaFim,
            correcoes: correcoes,
        });
    }

    protected comparacaoArgumentosContraParametrosFuncao(
        simboloFuncao: SimboloInterface,
        parametros: ParametroInterface[],
        argumentos: Construto[]
    ) {
        if (parametros.length !== argumentos.length) {
            this.erro(
                simboloFuncao,
                `Função '${simboloFuncao.lexema}' espera ${parametros.length} parâmetros. Atual: ${argumentos.length}.`
            );
        }

        for (let [indice, parametro] of parametros.entries()) {
            const argumento = argumentos[indice];
            if (argumento) {
                // Usando `obterTipoExpressao` para resolver adequadamente o tipo do argumento, 
                // independentemente de ser um `Literal` (tipo já resolvido), `Variavel` (tipo inferido do
                // escopo), `Binario`, `Agrupamento`, ou qualquer outro construto (retorna `null` quando
                // o tipo não pode ser determinado em tempo de compilação).
                const tipoArgumento = this.obterTipoExpressao(argumento);

                // Validar apenas quando ambos os lados têm um tipo específico e determinável.
                // Ignorar quando `tipoArgumento` é nulo (por exemplo, resultado de `Chamada`) ou `qualquer`,
                // evitando falsos positivos para expressões cujo tipo é desconhecido em tempo de compilação.
                if (tipoArgumento && tipoArgumento !== 'qualquer' && parametro.tipoDado) {
                    if (parametro.tipoDado === 'texto' && tipoArgumento !== 'texto') {
                        this.erro(
                            simboloFuncao,
                            `O valor passado para o parâmetro '${parametro.nome.lexema}' (${parametro.tipoDado}) é diferente do esperado pela função (${tipoArgumento}).`
                        );
                    } else if (['inteiro', 'número', 'real'].includes(parametro.tipoDado)) {
                        // Delegua suporta conversões implícitas entre tipos numéricos, mas não
                        // entre texto e número.
                        if (!['inteiro', 'número', 'real'].includes(tipoArgumento)) {
                            this.erro(
                                simboloFuncao,
                                `O valor passado para o parâmetro '${parametro.nome.lexema}' (${parametro.tipoDado}) é diferente do esperado pela função (${tipoArgumento}).`
                            );
                        }
                    }
                }
            }
        }
    }

    /**
     * Obtém o tipo de uma expressão (pode ser Literal, Variavel, Binario, Leia, etc)
     */
    protected obterTipoExpressao(expressao: Construto): string | null {
        if (expressao instanceof Literal) {
            return expressao.tipo;
        }

        if (expressao instanceof Variavel) {
            const variavel = this.gerenciadorEscopos.buscar(expressao.simbolo.lexema);
            return variavel?.tipo || null;
        }

        if (expressao instanceof Binario) {
            // Para binários, tentamos inferir o tipo baseado nos operandos
            return this.inferirTipoBinario(expressao);
        }

        if (expressao instanceof Logico) {
            // Operadores lógicos sempre retornam tipo lógico
            return 'lógico';
        }

        if (expressao instanceof Agrupamento) {
            return this.obterTipoExpressao(expressao.expressao);
        }

        if (expressao instanceof Leia) {
            // leia() sempre retorna texto
            return 'texto';
        }

        return null;
    }

    /**
     * Infere o tipo de resultado de uma operação binária
     */
    protected inferirTipoBinario(binario: Binario): string | null {
        const operadoresMatematicos = ['ADICAO', 'SUBTRACAO', 'MULTIPLICACAO', 'DIVISAO', 'MODULO'];
        const operadoresComparacao = ['MAIOR', 'MAIOR_IGUAL', 'MENOR', 'MENOR_IGUAL', 'IGUAL', 'DIFERENTE'];

        // Operadores de comparação sempre retornam lógico
        if (operadoresComparacao.includes(binario.operador.tipo)) {
            return 'lógico';
        }

        const tipoEsquerda = this.obterTipoExpressao(binario.esquerda);
        const tipoDireita = this.obterTipoExpressao(binario.direita);

        if (!tipoEsquerda || !tipoDireita) {
            return null;
        }
        
        if (operadoresMatematicos.includes(binario.operador.tipo)) {
            const tiposNumericos = ['inteiro', 'número', 'real'];
            if (tiposNumericos.includes(tipoEsquerda) && tiposNumericos.includes(tipoDireita)) {
                // Se um dos lados é 'real', o resultado é 'real'
                if (tipoEsquerda === 'real' || tipoDireita === 'real') {
                    return 'real';
                }

                return 'número';
            }
            
            // Concatenação de textos
            if (tipoEsquerda === 'texto' || tipoDireita === 'texto') {
                return 'texto';
            }
        }
        
        return 'qualquer';
    }

     /**
     * Marca as variáveis usadas em uma expressão.
     */
    protected marcarVariaveisUsadasEmExpressao(expressao: Construto): void {
        if (expressao instanceof Variavel) {
            this.gerenciadorEscopos.marcarComoUsada(expressao.simbolo.lexema);
            return;
        }

        if (expressao instanceof Binario) {
            this.marcarVariaveisUsadasEmExpressao(expressao.esquerda);
            this.marcarVariaveisUsadasEmExpressao(expressao.direita);
            return;
        }

        if (expressao instanceof Agrupamento) {
            this.marcarVariaveisUsadasEmExpressao(expressao.expressao);
            return;
        }

        if (expressao instanceof Chamada) {
            this.marcarVariaveisUsadasEmExpressao(expressao.entidadeChamada);

            for (const arg of expressao.argumentos) {
                this.marcarVariaveisUsadasEmExpressao(arg);
            }
            return;
        }

        if (expressao instanceof AcessoMetodo ||
            expressao instanceof AcessoMetodoOuPropriedade ||
            expressao instanceof AcessoPropriedade) {
            this.marcarVariaveisUsadasEmExpressao((expressao as any).objeto);
            return;
        }

        if (expressao instanceof Logico) {
            this.marcarVariaveisUsadasEmExpressao(expressao.esquerda);
            this.marcarVariaveisUsadasEmExpressao(expressao.direita);
            return;
        }

        if (expressao instanceof Unario) {
            this.marcarVariaveisUsadasEmExpressao(expressao.operando);
            return;
        }

        if (expressao instanceof AcessoIndiceVariavel) {
            this.marcarVariaveisUsadasEmExpressao(expressao.entidadeChamada);
            this.marcarVariaveisUsadasEmExpressao(expressao.indice);
            return;
        }

        // TODO: Adicionar outros tipos de expressões conforme necessário.
    }

    /**
     * Analisa se todos os caminhos retornam
     * @returns true se todos os caminhos retornam, false caso contrário
     */
    protected todosOsCaminhosRetornam(declaracoes: Declaracao[]): boolean {
        return this.verificarBlocoRetorna(declaracoes);
    }

    private verificarBlocoRetorna(declaracoes: Declaracao[]): boolean {
        for (let i = 0; i < declaracoes.length; i++) {
            const declaracao = declaracoes[i];

            if (declaracao instanceof Retorna) {
                return true;
            }

            if (declaracao instanceof Se) {
                const todosOsCaminhosSe = this.verificarSeRetorna(declaracao);
                if (todosOsCaminhosSe) {
                    return true;
                }
            }

            if (declaracao instanceof Escolha) {
                const todosOsCaminhosEscolha = this.verificarEscolhaRetorna(declaracao);
                if (todosOsCaminhosEscolha) {
                    return true;
                }
            }
        }

        return false;
    }

    protected verificarSeRetorna(declaracaoSe: Se): boolean {
        const caminhoEntaoResolvido = declaracaoSe.caminhoEntao as Bloco;
        const entaoRetorna = this.verificarBlocoRetorna(caminhoEntaoResolvido.declaracoes);

        const caminhoSenaoResolvido = declaracaoSe.caminhoSenao as Bloco | Se | null;
        if (!caminhoSenaoResolvido || (caminhoSenaoResolvido as Bloco).declaracoes?.length === 0) {
            return false;
        }

        if (caminhoSenaoResolvido instanceof Se && (caminhoSenaoResolvido.caminhoEntao as Bloco).declaracoes?.length === 1) {
            const senaoSeRetorna = this.verificarSeRetorna(
                caminhoSenaoResolvido as Se
            );
            return entaoRetorna && senaoSeRetorna;
        }

        const senaoRetorna = this.verificarBlocoRetorna((declaracaoSe.caminhoSenao as Bloco).declaracoes);
        return entaoRetorna && senaoRetorna;
    }

    private verificarEscolhaRetorna(declaracaoEscolha: Escolha): boolean {
        let temPadrao = false;

        // Verifica se todos os caminhos retornam
        for (let caminho of declaracaoEscolha.caminhos) {
            const caminhoRetorna = this.verificarBlocoRetorna(caminho.declaracoes);
            if (!caminhoRetorna) {
                return false;
            }

            // Verifica se há um caso padrão
            if (caminho.condicoes.length === 0) {
                temPadrao = true;
            }
        }

        // Se não há caso padrão, não podemos garantir que todos os caminhos retornam
        return temPadrao;
    }

    visitarDeclaracaoTextoDocumentacao(declaracao: TextoDocumentacao): Promise<any> | void {
        return Promise.resolve();
    }

    visitarExpressaoAcessoIntervaloVariavel(expressao: AcessoIntervaloVariavel): Promise<any> | void {
        return Promise.resolve();
    }

    visitarExpressaoTuplaN(expressao: TuplaN): Promise<any> | void {
        return Promise.resolve();
    }

    visitarExpressaoComentario(expressao: ComentarioComoConstruto): Promise<any> | void {
        // Comentários não afetam a análise semântica, então não faz nada.
        return Promise.resolve();
    }

    visitarExpressaoSeparador(expressao: Separador): Promise<any> | void {
        // Separadores não afetam a análise semântica, então não faz nada.
        return Promise.resolve();
    }

    diagnosticos: DiagnosticoAnalisadorSemantico[];

    abstract analisar(declaracoes: Declaracao[]): Promise<RetornoAnalisadorSemantico>;

    adicionarDiagnostico(
        simbolo: SimboloInterface,
        mensagem: string,
        severidade: DiagnosticoSeveridade = DiagnosticoSeveridade.AVISO
    ): void {
        this.diagnosticos.push({
            simbolo: simbolo,
            mensagem: mensagem,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
            severidade: severidade,
        });
    }

    visitarExpressaoArgumentoReferenciaFuncao(
        expressao: ArgumentoReferenciaFuncao
    ): Promise<any> | void {
        return Promise.resolve();
    }

    visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> | void {
        return Promise.resolve();
    }

    visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> | void {
        return Promise.resolve();
    }

    visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> | void {
        return Promise.resolve();
    }

    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoClasse(declaracao: Classe): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoComentario(declaracao: Comentario): void | Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoImportar(declaracao: Importar): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoSe(declaracao: Se): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoTente(declaracao: Tente): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        return Promise.resolve();
    }

    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAcessoMetodoOuPropriedade(expressao: AcessoMetodoOuPropriedade): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoAtribuicaoPorIndicesMatriz(
        expressao: AtribuicaoPorIndicesMatriz
    ): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoBinaria(expressao: Binario): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        return null;
    }

    visitarExpressaoDeChamada(expressao: Chamada): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoDeVariavel(expressao: Variavel | Constante): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoDicionario(expressao: Dicionario): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> {
        return;
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoFalhar(expressao: Falhar): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoFimPara(declaracao: FimPara): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoIsto(expressao: Isto): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoLeia(expressao: Leia): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoLiteral(expressao: Literal): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoLogica(expressao: Logico): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        return;
    }

    visitarExpressaoSuper(expressao: Super): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        return null;
    }

    visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoUnaria(expressao: Unario): Promise<any> {
        return Promise.resolve();
    }

    visitarExpressaoVetor(expressao: Vetor): Promise<any> {
        return Promise.resolve();
    }
}
