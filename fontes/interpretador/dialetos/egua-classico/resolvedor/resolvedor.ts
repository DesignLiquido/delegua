import { AcessoMetodoOuPropriedade, Construto, ExpressaoRegular, FimPara, FormatacaoEscrita, QualTipo, Super, TipoDe, Tupla, Variavel } from '../../../../construtos';
import {
    Aleatorio,
    Bloco,
    CabecalhoPrograma,
    Const,
    ConstMultiplo,
    Declaracao,
    EscrevaMesmaLinha,
    Expressao,
    Leia,
    LeiaMultiplo,
    ParaCada,
    Se,
    Var,
    VarMultiplo,
} from '../../../../declaracoes';
import { InicioAlgoritmo } from '../../../../declaracoes/inicio-algoritmo';
import { EspacoVariaveis } from '../../../../espaco-variaveis';
import { InterpretadorInterface, SimboloInterface } from '../../../../interfaces';
import { PilhaEscoposExecucaoInterface } from '../../../../interfaces/pilha-escopos-execucao-interface';
import { ResolvedorInterface } from '../../../../interfaces/resolvedor-interface';
import { RetornoInterpretador } from '../../../../interfaces/retornos';
import { ErroResolvedor } from './erro-resolvedor';
import { PilhaEscopos } from './pilha-escopos';
import { RetornoResolvedor } from './retorno-resolvedor';

const TipoFuncao = {
    NENHUM: 'NENHUM',
    FUNÇÃO: 'FUNÇÃO',
    CONSTRUTOR: 'CONSTRUTOR',
    METODO: 'METODO',
};

const TipoClasse = {
    NENHUM: 'NENHUM',
    CLASSE: 'CLASSE',
    SUBCLASSE: 'SUBCLASSE',
};

const LoopType = {
    NENHUM: 'NENHUM',
    ENQUANTO: 'ENQUANTO',
    ESCOLHA: 'ESCOLHA',
    PARA: 'PARA',
    FAZER: 'FAZER',
};

/**
 * O Resolvedor (Resolver) é responsável por catalogar todos os identificadores complexos, como por exemplo: funções, classes, variáveis,
 * e delimitar os escopos onde esses identificadores existem.
 *
 * Exemplo: uma classe A declara dois métodos chamados M e N. Todas as variáveis declaradas dentro de M não podem ser vistas por N, e vice-versa.
 * No entanto, todas as variáveis declaradas dentro da classe A podem ser vistas tanto por M quanto por N.
 *
 * Não faz sentido ser implementado nos outros interpretadores pelos outros optarem por uma pilha de execução que
 * espera importar qualquer coisa a qualquer momento.
 */
export class ResolvedorEguaClassico implements ResolvedorInterface, InterpretadorInterface {
    erros: ErroResolvedor[];
    escopos: PilhaEscopos;
    locais: Map<Construto, number>;
    funcaoAtual: any;
    classeAtual: any;
    cicloAtual: any;
    interfaceEntradaSaida: any = null;

    diretorioBase: any;
    funcaoDeRetorno: Function;
    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;

    constructor() {
        this.erros = [];
        this.escopos = new PilhaEscopos();
        this.locais = new Map();

        this.funcaoAtual = TipoFuncao.NENHUM;
        this.classeAtual = TipoClasse.NENHUM;
        this.cicloAtual = TipoClasse.NENHUM;
    }

    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoTupla(expressao: Tupla): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoAcessoElementoMatriz(expressao: any) {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: any): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoQualTipo(expressao: QualTipo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoFalhar(expressao: any): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        throw new Error('Método não implementado.');
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        throw new Error('Método não implementado.');
    }

    avaliar(expressao: any) {
        throw new Error('Método não implementado.');
    }

    eVerdadeiro(objeto: any): boolean {
        throw new Error('Método não implementado.');
    }

    verificarOperandoNumero(operador: SimboloInterface, operando: any): void {
        throw new Error('Método não implementado.');
    }

    eIgual(esquerda: any, direita: any): boolean {
        throw new Error('Método não implementado.');
    }

    verificarOperandosNumeros(operador: SimboloInterface, direita: any, esquerda: any): void {
        throw new Error('Método não implementado.');
    }

    procurarVariavel(nome: SimboloInterface, expressao: any) {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoLeia(expressao: Leia): Promise<any> {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoLeiaMultiplo(expressao: LeiaMultiplo): Promise<any> {
        throw new Error('Método não implementado.');
    }

    executarBloco(declaracoes: Declaracao[], ambiente?: EspacoVariaveis): Promise<any> {
        throw new Error('Método não implementado.');
    }

    paraTexto(objeto: any) {
        throw new Error('Método não implementado.');
    }

    executar(declaracao: Declaracao, mostrarResultado: boolean) {
        throw new Error('Método não implementado.');
    }

    interpretar(declaracoes: Declaracao[], manterAmbiente?: boolean): Promise<RetornoInterpretador> {
        throw new Error('Método não implementado.');
    }

    finalizacao(): void {
        throw new Error('Método não implementado.');
    }

    definir(simbolo: SimboloInterface): void {
        if (this.escopos.eVazio()) return;
        this.escopos.topoDaPilha()[simbolo.lexema] = true;
    }

    declarar(simbolo: SimboloInterface): void {
        if (this.escopos.eVazio()) return;
        const escopo = this.escopos.topoDaPilha();
        if (escopo.hasOwnProperty(simbolo.lexema)) {
            const erro = new ErroResolvedor(simbolo, 'Variável com esse nome já declarada neste escopo.');
            this.erros.push(erro);
        }

        escopo[simbolo.lexema] = false;
    }

    inicioDoEscopo(): void {
        this.escopos.empilhar({});
    }

    finalDoEscopo(): void {
        this.escopos.removerUltimo();
    }

    resolverLocal(expressao: Construto, simbolo: SimboloInterface): void {
        for (let i = this.escopos.pilha.length - 1; i >= 0; i--) {
            if (this.escopos.pilha[i].hasOwnProperty(simbolo.lexema)) {
                this.locais.set(expressao, this.escopos.pilha.length - 1 - i);
            }
        }
    }

    visitarExpressaoBloco(declaracao: Bloco): any {
        this.inicioDoEscopo();
        this.resolver(declaracao.declaracoes);
        this.finalDoEscopo();
        return null;
    }

    visitarExpressaoDeVariavel(expressao: Variavel): any {
        if (!this.escopos.eVazio() && this.escopos.topoDaPilha()[expressao.simbolo.lexema] === false) {
            const erro = new ErroResolvedor(
                expressao.simbolo,
                'Não é possível ler a variável local em seu próprio inicializador.'
            );
            this.erros.push(erro);
            throw erro;
        }
        this.resolverLocal(expressao, expressao.simbolo);
        return null;
    }

    visitarDeclaracaoVar(declaracao: Var): any {
        this.declarar(declaracao.simbolo);
        if (declaracao.inicializador !== null) {
            this.resolver(declaracao.inicializador);
        }
        this.definir(declaracao.simbolo);
        return null;
    }

    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): any {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoDeAtribuicao(expressao: any): any {
        this.resolver(expressao.valor);
        this.resolverLocal(expressao, expressao.simbolo);
        return null;
    }

    resolverFuncao(funcao: any, funcType: any): void {
        const enclosingFunc = this.funcaoAtual;
        this.funcaoAtual = funcType;

        this.inicioDoEscopo();
        const parametros = funcao.parametros;

        if (parametros && parametros.length > 0) {
            for (let i = 0; i < parametros.length; i++) {
                this.declarar(parametros[i]['nome']);
                this.definir(parametros[i]['nome']);
            }
        }

        this.resolver(funcao.corpo);
        this.finalDoEscopo();

        this.funcaoAtual = enclosingFunc;
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: any): any {
        this.declarar(declaracao.simbolo);
        this.definir(declaracao.simbolo);

        this.resolverFuncao(declaracao.funcao, TipoFuncao.FUNÇÃO);
        return null;
    }

    visitarExpressaoDeleguaFuncao(declaracao: any): any {
        this.resolverFuncao(declaracao, TipoFuncao.FUNÇÃO);
        return null;
    }

    visitarDeclaracaoTente(declaracao: any): any {
        this.resolver(declaracao.caminhoTente);

        if (declaracao.caminhoPegue !== null) this.resolver(declaracao.caminhoPegue);
        if (declaracao.caminhoSenao !== null) this.resolver(declaracao.caminhoSenao);
        if (declaracao.caminhoFinalmente !== null) this.resolver(declaracao.caminhoFinalmente);
    }

    visitarDeclaracaoClasse(declaracao: any): any {
        const enclosingClass = this.classeAtual;
        this.classeAtual = TipoClasse.CLASSE;

        this.declarar(declaracao.simbolo);
        this.definir(declaracao.simbolo);

        if (declaracao.superClasse !== null && declaracao.simbolo.lexema === declaracao.superClasse.simbolo.lexema) {
            const erro = new ErroResolvedor(declaracao.simbolo, 'Uma classe não pode herdar de si mesma.');
            this.erros.push(erro);
        }

        if (declaracao.superClasse !== null) {
            this.classeAtual = TipoClasse.SUBCLASSE;
            this.resolver(declaracao.superClasse);
        }

        if (declaracao.superClasse !== null) {
            this.inicioDoEscopo();
            this.escopos.topoDaPilha()['super'] = true;
        }

        this.inicioDoEscopo();
        this.escopos.topoDaPilha()['isto'] = true;

        const metodos = declaracao.metodos;
        for (let i = 0; i < metodos.length; i++) {
            let declaracao = TipoFuncao.METODO;

            if (metodos[i].simbolo.lexema === 'isto') {
                declaracao = TipoFuncao.CONSTRUTOR;
            }

            this.resolverFuncao(metodos[i].funcao, declaracao);
        }

        this.finalDoEscopo();

        if (declaracao.superClasse !== null) this.finalDoEscopo();

        this.classeAtual = enclosingClass;
        return null;
    }

    visitarExpressaoSuper(expressao: Super): any {
        if (this.classeAtual === TipoClasse.NENHUM) {
            const erro = new ErroResolvedor(expressao.simboloChave, "Não pode usar 'super' fora de uma classe.");
            this.erros.push(erro);
        } else if (this.classeAtual !== TipoClasse.SUBCLASSE) {
            const erro = new ErroResolvedor(expressao.simboloChave, "Não se usa 'super' numa classe sem SuperClasse.");
            this.erros.push(erro);
        }

        this.resolverLocal(expressao, expressao.simboloChave);
        return null;
    }

    visitarExpressaoAcessoMetodo(expressao: AcessoMetodoOuPropriedade): any {
        this.resolver(expressao.objeto);
        return null;
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao): any {
        this.resolver(declaracao.expressao);
        return null;
    }

    visitarDeclaracaoSe(declaracao: Se): any {
        this.resolver(declaracao.condicao);
        this.resolver(declaracao.caminhoEntao);

        for (let i = 0; i < declaracao.caminhosSeSenao.length; i++) {
            this.resolver(declaracao.caminhosSeSenao[i].condicao);
            this.resolver(declaracao.caminhosSeSenao[i].branch);
        }

        if (declaracao.caminhoSenao !== null) this.resolver(declaracao.caminhoSenao);
        return null;
    }

    visitarDeclaracaoImportar(declaracao: any): void {
        this.resolver(declaracao.caminho);
    }

    visitarDeclaracaoEscreva(declaracao: any): void {
        this.resolver(declaracao.expressao);
    }

    visitarExpressaoRetornar(declaracao: any): any {
        if (this.funcaoAtual === TipoFuncao.NENHUM) {
            const erro = new ErroResolvedor(
                declaracao.palavraChave,
                'Não é possível retornar do código do escopo superior.'
            );
            this.erros.push(erro);
        }

        if (declaracao.valor !== null) {
            if (this.funcaoAtual === TipoFuncao.CONSTRUTOR) {
                const erro = new ErroResolvedor(declaracao.palavraChave, 'Não pode retornar o valor do construtor.');
                this.erros.push(erro);
            }
            this.resolver(declaracao.valor);
        }
        return null;
    }

    visitarDeclaracaoEscolha(declaracao: any): void {
        const enclosingType = this.cicloAtual;
        this.cicloAtual = LoopType.ESCOLHA;

        const caminhos = declaracao.caminhos;
        const caminhoPadrao = declaracao.caminhoPadrao;

        for (let i = 0; i < caminhos.length; i++) {
            this.resolver(caminhos[i]['declaracoes']);
        }

        if (caminhoPadrao !== null) this.resolver(caminhoPadrao['declaracoes']);

        this.cicloAtual = enclosingType;
    }

    visitarDeclaracaoEnquanto(declaracao: any): any {
        this.resolver(declaracao.condicao);
        this.resolver(declaracao.corpo);
        return null;
    }

    visitarDeclaracaoPara(declaracao: any): any {
        if (declaracao.inicializador !== null) {
            this.resolver(declaracao.inicializador);
        }
        if (declaracao.condicao !== null) {
            this.resolver(declaracao.condicao);
        }
        if (declaracao.incrementar !== null) {
            this.resolver(declaracao.incrementar);
        }

        const enclosingType = this.cicloAtual;
        this.cicloAtual = LoopType.ENQUANTO;
        this.resolver(declaracao.corpo);
        this.cicloAtual = enclosingType;

        return null;
    }

    visitarDeclaracaoFazer(declaracao: any): any {
        this.resolver(declaracao.condicaoEnquanto);

        const enclosingType = this.cicloAtual;
        this.cicloAtual = LoopType.FAZER;
        this.resolver(declaracao.caminhoFazer);
        this.cicloAtual = enclosingType;
        return null;
    }

    visitarExpressaoBinaria(expressao: any): any {
        this.resolver(expressao.esquerda);
        this.resolver(expressao.direita);
        return null;
    }

    visitarExpressaoDeChamada(expressao: any): any {
        this.resolver(expressao.entidadeChamada);

        const argumentos = expressao.argumentos;
        for (let i = 0; i < argumentos.length; i++) {
            this.resolver(argumentos[i]);
        }

        return null;
    }

    visitarExpressaoAgrupamento(expressao: any): any {
        this.resolver(expressao.expressao);
        return null;
    }

    visitarExpressaoDicionario(expressao: any): any {
        for (let i = 0; i < expressao.chaves.length; i++) {
            this.resolver(expressao.chaves[i]);
            this.resolver(expressao.valores[i]);
        }
        return null;
    }

    visitarExpressaoVetor(expressao: any): any {
        for (let i = 0; i < expressao.valores.length; i++) {
            this.resolver(expressao.valores[i]);
        }
        return null;
    }

    visitarExpressaoAcessoIndiceVariavel(expressao: any): any {
        this.resolver(expressao.entidadeChamada);
        this.resolver(expressao.indice);
        return null;
    }

    visitarExpressaoContinua(declaracao?: any): any {
        return null;
    }

    visitarExpressaoSustar(declaracao?: any): any {
        return null;
    }

    visitarExpressaoAtribuicaoPorIndice(expressao?: any): any {
        return null;
    }

    visitarExpressaoLiteral(expressao?: any): any {
        return null;
    }

    visitarExpressaoLogica(expressao?: any): any {
        this.resolver(expressao.esquerda);
        this.resolver(expressao.direita);
        return null;
    }

    visitarExpressaoUnaria(expressao?: any): any {
        this.resolver(expressao.direita);
        return null;
    }

    visitarExpressaoDefinirValor(expressao?: any): any {
        this.resolver(expressao.valor);
        this.resolver(expressao.objeto);
        return null;
    }

    visitarExpressaoIsto(expressao?: any): any {
        if (this.classeAtual == TipoClasse.NENHUM) {
            const erro = new ErroResolvedor(expressao.palavraChave, "Não pode usar 'isto' fora da classe.");
            this.erros.push(erro);
        }
        this.resolverLocal(expressao, expressao.palavraChave);
        return null;
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> {
        throw new Error('Método não implementado.');
    }

    resolver(declaracoes: Construto | Declaracao | Declaracao[]): RetornoResolvedor {
        if (Array.isArray(declaracoes)) {
            for (let i = 0; i < declaracoes.length; i++) {
                if (declaracoes[i] && declaracoes[i].aceitar) {
                    declaracoes[i].aceitar(this);
                }
            }
        } else if (declaracoes) {
            declaracoes.aceitar(this);
        }

        return {
            erros: this.erros,
            locais: this.locais,
        } as RetornoResolvedor;
    }
}
