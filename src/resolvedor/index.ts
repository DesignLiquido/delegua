import { ResolvedorInterface } from "../interfaces/resolvedor-interface";
import { PilhaEscopos } from "./pilha-escopos";
import { ErroResolvedor } from "./erro-resolvedor";
import { Construto } from "../construtos";
import { Delegua } from "../delegua";
import { InterpretadorInterface, SimboloInterface } from "../interfaces";
import { Se } from "../declaracoes";

const TipoFuncao = {
    NENHUM: "NENHUM",
    FUNCAO: "FUNCAO",
    CONSTRUTOR: "CONSTRUTOR",
    METODO: "METODO"
};

const TipoClasse = {
    NENHUM: "NENHUM",
    CLASSE: "CLASSE",
    SUBCLASSE: "SUBCLASSE"
};

const LoopType = {
    NENHUM: "NENHUM",
    ENQUANTO: "ENQUANTO",
    ESCOLHA: "ESCOLHA",
    PARA: "PARA",
    FAZER: "FAZER"
};

/**
 * O Resolvedor (Resolver) é responsável por catalogar todos os identificadores complexos, como por exemplo: funções, classes, variáveis, 
 * e delimitar os escopos onde esses identificadores existem. 
 * Exemplo: uma classe A declara dois métodos chamados M e N. Todas as variáveis declaradas dentro de M não podem ser vistas por N, e vice-versa.
 * No entanto, todas as variáveis declaradas dentro da classe A podem ser vistas tanto por M quanto por N.
 */
export class Resolvedor implements ResolvedorInterface {
    interpretador: any;
    Delegua: any;
    escopos: PilhaEscopos;
    FuncaoAtual: any;
    ClasseAtual: any;
    cicloAtual: any;

    constructor(Delegua: Delegua, interpretador: InterpretadorInterface) {
        this.interpretador = interpretador;
        this.Delegua = Delegua;
        this.escopos = new PilhaEscopos();

        this.FuncaoAtual = TipoFuncao.NENHUM;
        this.ClasseAtual = TipoClasse.NENHUM;
        this.cicloAtual = TipoClasse.NENHUM;
    }

    definir(simbolo: SimboloInterface): void {
        if (this.escopos.eVazio()) return;
        this.escopos.topoDaPilha()[simbolo.lexema] = true;
    }

    declarar(simbolo: SimboloInterface): void {
        if (this.escopos.eVazio()) return;
        let escopo = this.escopos.topoDaPilha();
        if (escopo.hasOwnProperty(simbolo.lexema))
            this.Delegua.erro(
                simbolo,
                "Variável com esse nome já declarada neste escopo."
            );
        escopo[simbolo.lexema] = false;
    }

    inicioDoEscopo(): void {
        this.escopos.empilhar({});
    }

    finalDoEscopo(): void {
        this.escopos.removerUltimo();
    }

    resolver(declaracoes: Construto | Construto[]): void {
        if (Array.isArray(declaracoes)) {
            for (let i = 0; i < declaracoes.length; i++) {
                if (declaracoes[i] && declaracoes[i].aceitar) {
                    declaracoes[i].aceitar(this);
                }
            }
        } else if (declaracoes) {
            declaracoes.aceitar(this);
        }
    }

    resolverLocal(expressao: any, simbolo: any): void {
        for (let i = this.escopos.pilha.length - 1; i >= 0; i--) {
            if (this.escopos.pilha[i].hasOwnProperty(simbolo.lexema)) {
                this.interpretador.resolver(expressao, this.escopos.pilha.length - 1 - i);
            }
        }
    }

    visitarExpressaoBloco(stmt: any) : any {
        this.inicioDoEscopo();
        this.resolver(stmt.declaracoes);
        this.finalDoEscopo();
        return null;
    }

    visitarExpressaoDeVariavel(expressao: any): any {
        if (
            !this.escopos.eVazio() &&
            this.escopos.topoDaPilha()[expressao.simbolo.lexema] === false
        ) {
            throw new ErroResolvedor(
                "Não é possível ler a variável local em seu próprio inicializador."
            );
        }
        this.resolverLocal(expressao, expressao.simbolo);
        return null;
    }

    visitarExpressaoVar(stmt: any): any {
        this.declarar(stmt.simbolo);
        if (stmt.inicializador !== null) {
            this.resolver(stmt.inicializador);
        }
        this.definir(stmt.simbolo);
        return null;
    }

    visitarExpressaoDeAtribuicao(expr: any): any {
        this.resolver(expr.valor);
        this.resolverLocal(expr, expr.simbolo);
        return null;
    }

    resolverFuncao(funcao: any, funcType: any): void {
        let enclosingFunc = this.FuncaoAtual;
        this.FuncaoAtual = funcType;

        this.inicioDoEscopo();
        let parametros = funcao.parametros;

        if (parametros && parametros.length > 0) {
            for (let i = 0; i < parametros.length; i++) {
                this.declarar(parametros[i]["nome"]);
                this.definir(parametros[i]["nome"]);
            }
        }

        this.resolver(funcao.corpo);
        this.finalDoEscopo();

        this.FuncaoAtual = enclosingFunc;
    }

    visitarExpressaoFuncao(stmt: any): any {
        this.declarar(stmt.simbolo);
        this.definir(stmt.simbolo);

        this.resolverFuncao(stmt.funcao, TipoFuncao.FUNCAO);
        return null;
    }

    visitarExpressaoDeleguaFuncao(stmt: any): any {
        this.resolverFuncao(stmt, TipoFuncao.FUNCAO);
        return null;
    }

    visitarExpressaoTente(stmt: any): any {
        this.resolver(stmt.caminhoTente);

        if (stmt.caminhoPegue !== null) this.resolver(stmt.caminhoPegue);
        if (stmt.caminhoSenao !== null) this.resolver(stmt.caminhoSenao);
        if (stmt.caminhoFinalmente !== null) this.resolver(stmt.caminhoFinalmente);
    }

    visitarExpressaoClasse(stmt: any): any {
        let enclosingClass = this.ClasseAtual;
        this.ClasseAtual = TipoClasse.CLASSE;

        this.declarar(stmt.simbolo);
        this.definir(stmt.simbolo);

        if (
            stmt.superClasse !== null &&
            stmt.simbolo.lexema === stmt.superClasse.simbolo.lexema
        ) {
            this.Delegua.erro("Uma classe não pode herdar de si mesma.");
        }

        if (stmt.superClasse !== null) {
            this.ClasseAtual = TipoClasse.SUBCLASSE;
            this.resolver(stmt.superClasse);
        }

        if (stmt.superClasse !== null) {
            this.inicioDoEscopo();
            this.escopos.topoDaPilha()["super"] = true;
        }

        this.inicioDoEscopo();
        this.escopos.topoDaPilha()["isto"] = true;

        let metodos = stmt.metodos;
        for (let i = 0; i < metodos.length; i++) {
            let declaracao = TipoFuncao.METODO;

            if (metodos[i].simbolo.lexema === "isto") {
                declaracao = TipoFuncao.CONSTRUTOR;
            }

            this.resolverFuncao(metodos[i].funcao, declaracao);
        }

        this.finalDoEscopo();

        if (stmt.superClasse !== null) this.finalDoEscopo();

        this.ClasseAtual = enclosingClass;
        return null;
    }

    visitarExpressaoSuper(expr: any): any {
        if (this.ClasseAtual === TipoClasse.NENHUM) {
            this.Delegua.erro(expr.palavraChave, "Não pode usar 'super' fora de uma classe.");
        } else if (this.ClasseAtual !== TipoClasse.SUBCLASSE) {
            this.Delegua.erro(
                expr.palavraChave,
                "Não se usa 'super' numa classe sem SuperClasse."
            );
        }

        this.resolverLocal(expr, expr.palavraChave);
        return null;
    }

    visitarExpressaoObter(expr: any): any {
        this.resolver(expr.objeto);
        return null;
    }

    visitarDeclaracaoDeExpressao(stmt: any): any {
        this.resolver(stmt.expressao);
        return null;
    }

    visitarExpressaoSe(stmt: Se): any {
        this.resolver(stmt.condicao);
        this.resolver(stmt.caminhoEntao);

        for (let i = 0; i < stmt.caminhosSeSenao.length; i++) {
            this.resolver(stmt.caminhosSeSenao[i].condicao);
            this.resolver(stmt.caminhosSeSenao[i].caminho);
        }

        if (stmt.caminhoSenao !== null) this.resolver(stmt.caminhoSenao);
        return null;
    }

    visitarExpressaoImportar(stmt: any): void {
        this.resolver(stmt.caminho);
    }

    visitarExpressaoEscreva(stmt: any): void {
        this.resolver(stmt.expressao);
    }

    visitarExpressaoRetornar(stmt: any): any {
        if (this.FuncaoAtual === TipoFuncao.NENHUM) {
            this.Delegua.erro(stmt.palavraChave, "Não é possível retornar do código do escopo superior.");
        }

        if (stmt.valor !== null) {
            if (this.FuncaoAtual === TipoFuncao.CONSTRUTOR) {
                this.Delegua.erro(
                    stmt.palavraChave,
                    "Não pode retornar o valor do construtor."
                );
            }
            this.resolver(stmt.valor);
        }
        return null;
    }

    visitarExpressaoEscolha(stmt: any): void {
        let enclosingType = this.cicloAtual;
        this.cicloAtual = LoopType.ESCOLHA;

        let branches = stmt.branches;
        let defaultBranch = stmt.defaultBranch;

        for (let i = 0; i < branches.length; i++) {
            this.resolver(branches[i]["stmts"]);
        }

        if (defaultBranch !== null) this.resolver(defaultBranch["stmts"]);

        this.cicloAtual = enclosingType;
    }

    visitarExpressaoEnquanto(stmt: any): any {
        this.resolver(stmt.condicao);
        this.resolver(stmt.corpo);
        return null;
    }

    visitarExpressaoPara(stmt: any): any {
        if (stmt.inicializador !== null) {
            this.resolver(stmt.inicializador);
        }
        if (stmt.condicao !== null) {
            this.resolver(stmt.condicao);
        }
        if (stmt.incrementar !== null) {
            this.resolver(stmt.incrementar);
        }

        let enclosingType = this.cicloAtual;
        this.cicloAtual = LoopType.ENQUANTO;
        this.resolver(stmt.corpo);
        this.cicloAtual = enclosingType;

        return null;
    }

    visitarExpressaoFazer(stmt: any): any {
        this.resolver(stmt.whileCondition);

        let enclosingType = this.cicloAtual;
        this.cicloAtual = LoopType.FAZER;
        this.resolver(stmt.doBranch);
        this.cicloAtual = enclosingType;
        return null;
    }

    visitarExpressaoBinaria(expr: any): any {
        this.resolver(expr.esquerda);
        this.resolver(expr.direita);
        return null;
    }

    visitarExpressaoDeChamada(expr: any): any {
        this.resolver(expr.entidadeChamada);

        let argumentos = expr.argumentos;
        for (let i = 0; i < argumentos.length; i++) {
            this.resolver(argumentos[i]);
        }

        return null;
    }

    visitarExpressaoAgrupamento(expr: any): any {
        this.resolver(expr.expressao);
        return null;
    }

    visitarExpressaoDicionario(expr: any): any {
        for (let i = 0; i < expr.chaves.length; i++) {
            this.resolver(expr.chaves[i]);
            this.resolver(expr.valores[i]);
        }
        return null;
    }

    visitarExpressaoVetor(expr: any): any {
        for (let i = 0; i < expr.valores.length; i++) {
            this.resolver(expr.valores[i]);
        }
        return null;
    }

    visitarExpressaoVetorIndice(expr: any): any {
        this.resolver(expr.entidadeChamada);
        this.resolver(expr.indice);
        return null;
    }

    visitarExpressaoContinua(stmt?: any): any {
        return null;
    }

    visitarExpressaoPausa(stmt?: any): any {
        return null;
    }

    visitarExpressaoAtribuicaoSobrescrita(expr?: any): any {
        return null;
    }

    visitarExpressaoLiteral(expr?: any): any {
        return null;
    }

    visitarExpressaoLogica(expr?: any): any {
        this.resolver(expr.esquerda);
        this.resolver(expr.direita);
        return null;
    }

    visitarExpressaoUnaria(expr?: any): any {
        this.resolver(expr.direita);
        return null;
    }

    visitarExpressaoDefinir(expr?: any): any {
        this.resolver(expr.valor);
        this.resolver(expr.objeto);
        return null;
    }

    visitarExpressaoIsto(expr?: any): any {
        if (this.ClasseAtual == TipoClasse.NENHUM) {
            this.Delegua.erro(expr.palavraChave, "Não pode usar 'isto' fora da classe.");
        }
        this.resolverLocal(expr, expr.palavraChave);
        return null;
    }
};