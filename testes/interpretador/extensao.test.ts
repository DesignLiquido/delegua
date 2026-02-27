import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Interpretador } from '../../fontes/interpretador';
import { Lexador } from '../../fontes/lexador';

describe('Interpretador - Extensões', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;
    let interpretador: Interpretador;
    let _saidas: string[];

    beforeEach(() => {
        _saidas = [];
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
        interpretador = new Interpretador(process.cwd(), false, (texto: string) => {
            _saidas.push(texto);
        });
    });

    async function interpretar(codigo: string[]) {
        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
        return await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    }

    describe('Extensão de número', () => {
        it('Método simples com retorno usando isto', async () => {
            const codigo = [
                'extensão de número {',
                '    dobro() {',
                '        retorna isto * 2',
                '    }',
                '}',
                'var n = 5',
                'escreva(n.dobro())',
            ];
            const resultado = await interpretar(codigo);
            expect(resultado.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('10');
        });

        it('Método sem parâmetros usando isto em expressão', async () => {
            const codigo = [
                'extensão de número {',
                '    ehPar() {',
                '        retorna isto % 2 == 0',
                '    }',
                '}',
                'var n1 = 4',
                'var n2 = 3',
                'escreva(n1.ehPar())',
                'escreva(n2.ehPar())',
            ];
            const resultado = await interpretar(codigo);
            expect(resultado.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('verdadeiro');
            expect(_saidas[1]).toBe('falso');
        });

        it('Método com parâmetros', async () => {
            const codigo = [
                'extensão de número {',
                '    somarCom(outro) {',
                '        retorna isto + outro',
                '    }',
                '}',
                'var n = 3',
                'escreva(n.somarCom(7))',
            ];
            const resultado = await interpretar(codigo);
            expect(resultado.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('10');
        });

        it('Múltiplos métodos em um bloco extensão', async () => {
            const codigo = [
                'extensão de número {',
                '    dobro() {',
                '        retorna isto * 2',
                '    }',
                '    triplo() {',
                '        retorna isto * 3',
                '    }',
                '}',
                'var n = 5',
                'escreva(n.dobro())',
                'escreva(n.triplo())',
            ];
            const resultado = await interpretar(codigo);
            expect(resultado.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('10');
            expect(_saidas[1]).toBe('15');
        });
    });

    describe('Extensão de texto', () => {
        it('Método usando isto em operação de texto', async () => {
            const codigo = [
                'extensão de texto {',
                '    gritando() {',
                '        retorna isto.maiusculo()',
                '    }',
                '}',
                'var t = "olá"',
                'escreva(t.gritando())',
            ];
            const resultado = await interpretar(codigo);
            expect(resultado.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('OLÁ');
        });

        it('Método com parâmetros em texto', async () => {
            const codigo = [
                'extensão de texto {',
                '    repetir(n) {',
                '        var r = ""',
                '        para (var i = 0; i < n; i = i + 1) {',
                '            r = r + isto',
                '        }',
                '        retorna r',
                '    }',
                '}',
                'var t = "ab"',
                'escreva(t.repetir(3))',
            ];
            const resultado = await interpretar(codigo);
            expect(resultado.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('ababab');
        });
    });

    describe('Extensão de objeto (base universal)', () => {
        it('Método de objeto chamado em número', async () => {
            const codigo = [
                'extensão de objeto {',
                '    descricao() {',
                '        retorna "valor: " + isto',
                '    }',
                '}',
                'var n = 42',
                'escreva(n.descricao())',
            ];
            const resultado = await interpretar(codigo);
            expect(resultado.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('valor: 42');
        });

        it('Método de objeto chamado em texto', async () => {
            const codigo = [
                'extensão de objeto {',
                '    descricao() {',
                '        retorna "valor: " + isto',
                '    }',
                '}',
                'var t = "mundo"',
                'escreva(t.descricao())',
            ];
            const resultado = await interpretar(codigo);
            expect(resultado.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('valor: mundo');
        });

        it('Método de objeto chamado em instância de classe', async () => {
            const codigo = [
                'extensão de objeto {',
                '    identificar() {',
                '        retorna "sou um objeto"',
                '    }',
                '}',
                'classe Ponto {',
                '    construtor() {}',
                '}',
                'var p = Ponto()',
                'escreva(p.identificar())',
            ];
            const resultado = await interpretar(codigo);
            expect(resultado.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('sou um objeto');
        });
    });

    describe('Extensão de classe definida pelo usuário', () => {
        it('Adiciona método a classe existente', async () => {
            const codigo = [
                'classe Ponto {',
                '    x: número',
                '    y: número',
                '    construtor(px: número, py: número) {',
                '        isto.x = px',
                '        isto.y = py',
                '    }',
                '}',
                'extensão de Ponto {',
                '    distanciaOrigem() {',
                '        retorna (isto.x * isto.x + isto.y * isto.y) ** 0.5',
                '    }',
                '}',
                'var p = Ponto(3, 4)',
                'escreva(p.distanciaOrigem())',
            ];
            const resultado = await interpretar(codigo);
            expect(resultado.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('5');
        });
    });

    describe('Extensão global', () => {
        it('Extensão global de número fica disponível', async () => {
            const codigo = [
                'extensão global de número {',
                '    quadrado() {',
                '        retorna isto * isto',
                '    }',
                '}',
                'var n = 6',
                'escreva(n.quadrado())',
            ];
            const resultado = await interpretar(codigo);
            expect(resultado.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('36');
        });
    });
});
