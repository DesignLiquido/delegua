import { ResolvedorInterface } from '../interfaces/resolvedor-interface';
import { PilhaEscopos } from './pilha-escopos';
import { ErroResolvedor } from './erro-resolvedor';
import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    Agrupamento,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    Dicionario,
    Funcao,
    Logico,
    Super,
    Variavel,
    Vetor,
} from '../construtos';
import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import {
    Bloco,
    Classe,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    Funcao as FuncaoDeclaracao,
    Importar,
    Para,
    Se,
    Tente,
    Var,
} from '../declaracoes';
import { RetornoResolvedor } from './retorno-resolvedor';

const TipoFuncao = {
    NENHUM: 'NENHUM',
    FUNCAO: 'FUNCAO',
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
 * Exemplo: uma classe A declara dois métodos chamados M e N. Todas as variáveis declaradas dentro de M não podem ser vistas por N, e vice-versa.
 * No entanto, todas as variáveis declaradas dentro da classe A podem ser vistas tanto por M quanto por N.
 */
export class Resolvedor implements ResolvedorInterface {
    interpretador: InterpretadorInterface;
    erros: ErroResolvedor[];
    escopos: PilhaEscopos;
    funcaoAtual: any;
    classeAtual: any;
    cicloAtual: any;

    constructor(interpretador: InterpretadorInterface) {
        this.interpretador = interpretador;
        this.erros = [];
        this.escopos = new PilhaEscopos();

        this.funcaoAtual = TipoFuncao.NENHUM;
        this.classeAtual = TipoClasse.NENHUM;
        this.cicloAtual = TipoClasse.NENHUM;
    }

    definir(simbolo: SimboloInterface): void {
        if (this.escopos.eVazio()) return;
        this.escopos.topoDaPilha()[simbolo.lexema] = true;
    }

    declarar(simbolo: SimboloInterface): void {
        if (this.escopos.eVazio()) return;
        let escopo = this.escopos.topoDaPilha();
        if (escopo.hasOwnProperty(simbolo.lexema)) {
            const erro = new ErroResolvedor(
                simbolo,
                'Variável com esse nome já declarada neste escopo.'
            );
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
                this.interpretador.resolver(
                    expressao,
                    this.escopos.pilha.length - 1 - i
                );
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
        if (
            !this.escopos.eVazio() &&
            this.escopos.topoDaPilha()[expressao.simbolo.lexema] === false
        ) {
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

    visitarExpressaoVar(declaracao: Var): any {
        this.declarar(declaracao.simbolo);
        if (declaracao.inicializador !== null) {
            this.resolver(declaracao.inicializador);
        }
        this.definir(declaracao.simbolo);
        return null;
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir): any {
        this.resolver(expressao.valor);
        this.resolverLocal(expressao, expressao.simbolo);
        return null;
    }

    resolverFuncao(funcao: Funcao, tipoFuncao: string): void {
        let enclosingFunc = this.funcaoAtual;
        this.funcaoAtual = tipoFuncao;

        this.inicioDoEscopo();
        let parametros = funcao.parametros;

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

    visitarExpressaoFuncao(declaracao: FuncaoDeclaracao): any {
        this.declarar(declaracao.simbolo);
        this.definir(declaracao.simbolo);

        this.resolverFuncao(declaracao.funcao, TipoFuncao.FUNCAO);
        return null;
    }

    visitarExpressaoDeleguaFuncao(declaracao: Funcao): any {
        this.resolverFuncao(declaracao, TipoFuncao.FUNCAO);
        return null;
    }

    visitarExpressaoTente(declaracao: Tente): any {
        this.resolver(declaracao.caminhoTente);

        if (declaracao.caminhoPegue !== null)
            this.resolver(declaracao.caminhoPegue);
        if (declaracao.caminhoSenao !== null)
            this.resolver(declaracao.caminhoSenao);
        if (declaracao.caminhoFinalmente !== null)
            this.resolver(declaracao.caminhoFinalmente);
    }

    visitarExpressaoClasse(declaracao: Classe): any {
        let enclosingClass = this.classeAtual;
        this.classeAtual = TipoClasse.CLASSE;

        this.declarar(declaracao.simbolo);
        this.definir(declaracao.simbolo);

        if (
            declaracao.superClasse !== null &&
            declaracao.simbolo.lexema === declaracao.superClasse.simbolo.lexema
        ) {
            const erro = new ErroResolvedor(
                declaracao.simbolo,
                'Uma classe não pode herdar de si mesma.'
            );
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

        let metodos = declaracao.metodos;
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
            const erro = new ErroResolvedor(
                expressao.palavraChave,
                "Não pode usar 'super' fora de uma classe."
            );
            this.erros.push(erro);
            
        } else if (this.classeAtual !== TipoClasse.SUBCLASSE) {
            const erro = new ErroResolvedor(
                expressao.palavraChave,
                "Não se usa 'super' numa classe sem SuperClasse."
            );
            this.erros.push(erro);
        }

        this.resolverLocal(expressao, expressao.palavraChave);
        return null;
    }

    visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): any {
        this.resolver(expressao.objeto);
        return null;
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao): any {
        this.resolver(declaracao.expressao);
        return null;
    }

    visitarExpressaoSe(declaracao: Se): any {
        this.resolver(declaracao.condicao);
        this.resolver(declaracao.caminhoEntao);

        for (let i = 0; i < declaracao.caminhosSeSenao.length; i++) {
            this.resolver(declaracao.caminhosSeSenao[i].condicao);
            this.resolver(declaracao.caminhosSeSenao[i].caminho);
        }

        if (declaracao.caminhoSenao !== null)
            this.resolver(declaracao.caminhoSenao);
        return null;
    }

    visitarExpressaoImportar(declaracao: Importar): void {
        this.resolver(declaracao.caminho);
    }

    visitarExpressaoEscreva(declaracao: Escreva): void {
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
                const erro = new ErroResolvedor(
                    declaracao.palavraChave,
                    'Não pode retornar o valor do construtor.'
                );
                this.erros.push(erro);
            }
            this.resolver(declaracao.valor);
        }
        return null;
    }

    visitarExpressaoEscolha(declaracao: Escolha): void {
        let enclosingType = this.cicloAtual;
        this.cicloAtual = LoopType.ESCOLHA;

        let caminhos = declaracao.caminhos;
        let caminhoPadrao = declaracao.caminhoPadrao;

        for (let i = 0; i < caminhos.length; i++) {
            this.resolver(caminhos[i]['declaracoes']);
        }

        if (caminhoPadrao !== null) this.resolver(caminhoPadrao['declaracoes']);

        this.cicloAtual = enclosingType;
    }

    visitarExpressaoEnquanto(declaracao: Enquanto): any {
        this.resolver(declaracao.condicao);
        this.resolver(declaracao.corpo);
        return null;
    }

    visitarExpressaoPara(declaracao: Para): any {
        if (declaracao.inicializador !== null) {
            this.resolver(declaracao.inicializador);
        }
        if (declaracao.condicao !== null) {
            this.resolver(declaracao.condicao);
        }
        if (declaracao.incrementar !== null) {
            this.resolver(declaracao.incrementar);
        }

        let enclosingType = this.cicloAtual;
        this.cicloAtual = LoopType.ENQUANTO;
        this.resolver(declaracao.corpo);
        this.cicloAtual = enclosingType;

        return null;
    }

    visitarExpressaoFazer(declaracao: Fazer): any {
        this.resolver(declaracao.condicaoEnquanto);

        let enclosingType = this.cicloAtual;
        this.cicloAtual = LoopType.FAZER;
        this.resolver(declaracao.caminhoFazer);
        this.cicloAtual = enclosingType;
        return null;
    }

    visitarExpressaoBinaria(expressao: Binario): any {
        this.resolver(expressao.esquerda);
        this.resolver(expressao.direita);
        return null;
    }

    visitarExpressaoDeChamada(expressao: Chamada): any {
        this.resolver(expressao.entidadeChamada);

        let argumentos = expressao.argumentos;
        for (let i = 0; i < argumentos.length; i++) {
            this.resolver(argumentos[i]);
        }

        return null;
    }

    visitarExpressaoAgrupamento(expressao: Agrupamento): any {
        this.resolver(expressao.expressao);
        return null;
    }

    visitarExpressaoDicionario(expressao: Dicionario): any {
        for (let i = 0; i < expressao.chaves.length; i++) {
            this.resolver(expressao.chaves[i]);
            this.resolver(expressao.valores[i]);
        }
        return null;
    }

    visitarExpressaoVetor(expressao: Vetor): any {
        for (let i = 0; i < expressao.valores.length; i++) {
            this.resolver(expressao.valores[i]);
        }
        return null;
    }

    visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): any {
        this.resolver(expressao.entidadeChamada);
        this.resolver(expressao.indice);
        return null;
    }

    visitarExpressaoContinua(declaracao?: any): any {
        return null;
    }

    visitarExpressaoPausa(declaracao?: any): any {
        return null;
    }

    visitarExpressaoAtribuicaoSobrescrita(expressao?: any): any {
        return null;
    }

    visitarExpressaoLiteral(expressao?: any): any {
        return null;
    }

    visitarExpressaoLogica(expressao?: Logico): any {
        this.resolver(expressao.esquerda);
        this.resolver(expressao.direita);
        return null;
    }

    visitarExpressaoUnaria(expressao?: any): any {
        this.resolver(expressao.direita);
        return null;
    }

    visitarExpressaoDefinir(expressao?: any): any {
        this.resolver(expressao.valor);
        this.resolver(expressao.objeto);
        return null;
    }

    visitarExpressaoIsto(expressao?: any): any {
        if (this.classeAtual == TipoClasse.NENHUM) {
            const erro = new ErroResolvedor(
                expressao.palavraChave,
                "Não pode usar 'isto' fora da classe."
            );
            this.erros.push(erro);
        }

        this.resolverLocal(expressao, expressao.palavraChave);
        return null;
    }

    resolver(declaracoes: Construto | Construto[]): RetornoResolvedor {
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
            erros: this.erros
        } as RetornoResolvedor;
    }
}
