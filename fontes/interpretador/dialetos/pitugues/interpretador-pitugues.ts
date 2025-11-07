import {
    Construto,
    Atribuir,
    AcessoIndiceVariavel,
    AcessoElementoMatriz,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    AtribuicaoPorIndice,
    AtribuicaoPorIndicesMatriz,
    Binario,
    ComentarioComoConstruto,
    Chamada,
    DefinirValor,
    FuncaoConstruto,
    Variavel,
    Constante,
    Dicionario,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    Isto,
    Leia,
    Literal,
    Logico,
    ReferenciaFuncao,
    Separador,
    Super,
    Tupla,
    TipoDe,
    Unario,
    Vetor,
} from '../../../construtos';
import {
    Declaracao,
    CabecalhoPrograma,
    Classe,
    Comentario,
    Const,
    ConstMultiplo,
    Expressao,
    FuncaoDeclaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Fazer,
    InicioAlgoritmo,
    Para,
    Se,
    TendoComo,
    Tente,
    Var,
    VarMultiplo,
    Bloco,
    Continua,
    Falhar,
    Retorna,
    Sustar,
} from '../../../declaracoes';
import { InterpretadorInterface, RetornoInterpretadorInterface } from '../../../interfaces';
import { ErroInterpretador } from '../../../interfaces/erros/erro-interpretador';
import { EscopoExecucao } from '../../../interfaces/escopo-execucao';
import { PilhaEscoposExecucaoInterface } from '../../../interfaces/pilha-escopos-execucao-interface';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../../../quebras';
import { EspacoMemoria } from '../../espaco-memoria';
import { PilhaEscoposExecucao } from '../../pilha-escopos-execucao';

export class InterpretadorPitugues implements InterpretadorInterface {
    erros: ErroInterpretador[];
    diretorioBase: any;
    funcaoDeRetorno: Function;
    funcaoDeRetornoMesmaLinha: Function = null;
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    interfaceEntradaSaida: any;
    hashArquivoDeclaracaoAtual: number;
    linhaDeclaracaoAtual: number;

    constructor(
        diretorioBase: any,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        this.diretorioBase = diretorioBase;
        this.funcaoDeRetorno = funcaoDeRetorno || console.log;
        this.funcaoDeRetornoMesmaLinha =
            funcaoDeRetornoMesmaLinha || process.stdout.write.bind(process.stdout);

        this.erros = [];

        this.pilhaEscoposExecucao = new PilhaEscoposExecucao();
        const escopoExecucao: EscopoExecucao = {
            declaracoes: [],
            declaracaoAtual: 0,
            espacoMemoria: new EspacoMemoria(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);
    }

    eVerdadeiro(objeto: any): boolean {
        throw new Error('Method not implemented.');
    }
    avaliar(expressao: Construto | Declaracao) {
        throw new Error('Method not implemented.');
    }
    executarBloco(declaracoes: Declaracao[], ambiente?: EspacoMemoria): Promise<any> {
        throw new Error('Method not implemented.');
    }
    paraTexto(objeto: any) {
        throw new Error('Method not implemented.');
    }
    executar(declaracao: Declaracao, mostrarResultado?: boolean) {
        throw new Error('Method not implemented.');
    }
    resolverValor(objeto: any) {
        throw new Error('Method not implemented.');
    }
    interpretar(
        declaracoes: Declaracao[],
        manterAmbiente?: boolean
    ): Promise<RetornoInterpretadorInterface> {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoClasse(declaracao: Classe): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoComentario(declaracao: Comentario): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoConst(declaracao: Const): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoEscolha(declaracao: Escolha): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoPara(declaracao: Para): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoSe(declaracao: Se): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoTente(declaracao: Tente): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoVar(declaracao: Var): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoArgumentoReferenciaFuncao(
        expressao: ArgumentoReferenciaFuncao
    ): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoAtribuicaoPorIndicesMatriz(
        expressao: AtribuicaoPorIndicesMatriz
    ): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoBinaria(expressao: Binario): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoComentario(expressao: ComentarioComoConstruto): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoDeChamada(expressao: Chamada): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoDeVariavel(expressao: Variavel | Constante): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoDicionario(expressao: Dicionario): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<RegExp> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoFalhar(expressao: Falhar): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoFimPara(declaracao: FimPara): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoIsto(expressao: Isto): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoLeia(expressao: Leia): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoLiteral(expressao: Literal): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoLogica(expressao: Logico): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoRetornar(expressao: Retorna): Promise<RetornoQuebra> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoSeparador(expressao: Separador): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoSuper(expressao: Super): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoTupla(expressao: Tupla): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoUnaria(expressao: Unario): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
    visitarExpressaoVetor(expressao: Vetor): Promise<any> | void {
        throw new Error('Method not implemented.');
    }
}
