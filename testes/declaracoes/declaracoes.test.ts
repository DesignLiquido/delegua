import { FuncaoConstruto, Literal, Variavel } from '../../fontes/construtos';
import {
    Bloco,
    ConstMultiplo,
    Enquanto,
    Escolha,
    Fazer,
    FuncaoDeclaracao,
    Para,
    ParaCada,
    Se,
    TendoComo,
    Tente,
    VarMultiplo,
} from '../../fontes/declaracoes';
import { Simbolo } from '../../fontes/lexador';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

function simbolo(lexema: string): Simbolo {
    return new Simbolo(tiposDeSimbolos.IDENTIFICADOR, lexema, null, 1, 1);
}

function literal(valor: number): Literal {
    return new Literal(0, 1, valor);
}

function blocoVazio(): Bloco {
    return new Bloco(0, 1, []);
}

describe('paraTexto() das declarações', () => {
    describe('ConstMultiplo', () => {
        it('inclui nomes e inicializador', () => {
            const decl = new ConstMultiplo([simbolo('a'), simbolo('b')], literal(1));
            expect(decl.paraTexto()).toContain('nomes=[a,b]');
            expect(decl.paraTexto()).toContain('inicializador=');
        });

        it('exibe tipo quando definido', () => {
            const decl = new ConstMultiplo([simbolo('x')], literal(42), 'inteiro');
            expect(decl.paraTexto()).toContain('tipo=inteiro');
        });

        it('exibe qualquer quando tipo não definido', () => {
            const decl = new ConstMultiplo([simbolo('x')], literal(0));
            expect(decl.paraTexto()).toContain('tipo=qualquer');
        });
    });

    describe('VarMultiplo', () => {
        it('inclui nomes e inicializador', () => {
            const decl = new VarMultiplo([simbolo('a'), simbolo('b')], literal(1));
            expect(decl.paraTexto()).toContain('nomes=[a,b]');
            expect(decl.paraTexto()).toContain('inicializador=');
        });

        it('exibe tipo quando definido', () => {
            const decl = new VarMultiplo([simbolo('x')], literal(0), 'texto');
            expect(decl.paraTexto()).toContain('tipo=texto');
        });
    });

    describe('Enquanto', () => {
        it('inclui condição e corpo', () => {
            const decl = new Enquanto(literal(1), blocoVazio());
            const texto = decl.paraTexto();
            expect(texto).toContain('condição=');
            expect(texto).toContain('<bloco>');
            expect(texto).toContain('</enquanto>');
        });
    });

    describe('Fazer', () => {
        it('inclui corpo e condição', () => {
            const decl = new Fazer(0, 1, blocoVazio(), literal(1));
            const texto = decl.paraTexto();
            expect(texto).toContain('<bloco>');
            expect(texto).toContain('<condição>');
            expect(texto).toContain('</fazer>');
        });
    });

    describe('Se', () => {
        it('inclui condição e caminho então', () => {
            const decl = new Se(literal(1), blocoVazio());
            const texto = decl.paraTexto();
            expect(texto).toContain('condicao=');
            expect(texto).toContain('<então>');
            expect(texto).toContain('</se>');
        });

        it('inclui caminhos senão-se quando presentes', () => {
            const decl = new Se(literal(1), blocoVazio(), [{ condicao: literal(2), caminho: blocoVazio() }]);
            expect(decl.paraTexto()).toContain('<senão-se');
        });

        it('inclui caminho senão quando presente', () => {
            const decl = new Se(literal(1), blocoVazio(), undefined, blocoVazio());
            expect(decl.paraTexto()).toContain('<senão>');
        });
    });

    describe('Tente', () => {
        it('inclui blocos tente, pegue, senão e finalmente', () => {
            const decl = new Tente(0, 1, [], [], [], []);
            const texto = decl.paraTexto();
            expect(texto).toContain('<tente-corpo>');
            expect(texto).toContain('<pegue>');
            expect(texto).toContain('<senão>');
            expect(texto).toContain('<finalmente>');
        });
    });

    describe('TendoComo', () => {
        it('inclui variável, como e corpo', () => {
            const decl = new TendoComo(1, 0, simbolo('arq'), literal(0), blocoVazio());
            const texto = decl.paraTexto();
            expect(texto).toContain('variável=arq');
            expect(texto).toContain('como=');
            expect(texto).toContain('</tendo>');
        });
    });

    describe('Para', () => {
        it('inclui inicializador, condição, incremento e corpo', () => {
            const decl = new Para(0, 1, blocoVazio(), literal(1), literal(1), blocoVazio());
            const texto = decl.paraTexto();
            expect(texto).toContain('inicializador=');
            expect(texto).toContain('condição=');
            expect(texto).toContain('incremento=');
            expect(texto).toContain('</para>');
        });
    });

    describe('ParaCada', () => {
        it('inclui variável de iteração, vetor e corpo', () => {
            const variavel = new Variavel(0, simbolo('item'));
            const decl = new ParaCada(0, 1, variavel, literal(0), blocoVazio());
            const texto = decl.paraTexto();
            expect(texto).toContain('variávelIteração=');
            expect(texto).toContain('vetor=');
            expect(texto).toContain('</para-cada>');
        });
    });

    describe('FuncaoDeclaracao', () => {
        it('inclui nome, tipo e corpo da função', () => {
            const funcao = new FuncaoConstruto(0, 1, [], []);
            const decl = new FuncaoDeclaracao(simbolo('minhaFuncao'), funcao, 'inteiro');
            const texto = decl.paraTexto();
            expect(texto).toContain('nome=minhaFuncao');
            expect(texto).toContain('tipo=inteiro');
            expect(texto).toContain('construto-função');
            expect(texto).toContain('</declaração-função>');
        });
    });

    describe('Escolha', () => {
        it('inclui identificador e caminhos', () => {
            const caminho = { condicoes: [literal(1)], declaracoes: [] };
            const padrao = { condicoes: [], declaracoes: [] };
            const decl = new Escolha(literal(5), [caminho], padrao);
            const texto = decl.paraTexto();
            expect(texto).toContain('identificadorOuLiteral=');
            expect(texto).toContain('<caminho');
            expect(texto).toContain('<padrão>');
            expect(texto).toContain('</escolha>');
        });
    });
});
