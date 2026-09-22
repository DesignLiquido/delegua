import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Interpretador } from '../../fontes/interpretador';
import { Lexador } from '../../fontes/lexador';

describe('Tipo longo', () => {
    describe('Literais hexadecimais', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let interpretador: Interpretador;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        };

        beforeEach(() => {
            _saidas = [];
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        it('0xFF cria longo com valor 255', async () => {
            const codigo = ['var x = 0xFF', 'escreva(x)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('255');
        });

        it('Issue #1057 - Operação bitwise com número grande (4294967295 & 0x1E)', async () => {
            const codigo = [
                'var x = 0xFFFFFFFF',  // 4294967295
                'var y = 0x1E',        // 30
                'escreva(x & y)'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('30');  // Deve ser 30, não 60
        });

        it('Issue #1057 - Cenário completo: encode com deslocamento de 64 bits', async () => {
            const codigo = [
                'funcao encode(x, y) {',
                '    retorna (x << 32) | y',
                '}',
                'var num = encode(10, 20)',
                'escreva((num & 0xFFFFFFFF) + ((num >> 32) & 0xFFFFFFFF))'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('30');  // Esperado: 10 + 20 = 30
        });

        it('0xDEADBEEF cria longo com valor correto', async () => {
            const codigo = ['var x = 0xDEADBEEF', 'escreva(x)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('3735928559');
        });
    });

    describe('Literais binários', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let interpretador: Interpretador;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        };

        beforeEach(() => {
            _saidas = [];
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        it('0b1010 cria longo com valor 10', async () => {
            const codigo = ['var x = 0b1010', 'escreva(x)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('10');
        });

        it('0b11110000 cria longo com valor 240', async () => {
            const codigo = ['escreva(0b11110000)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('240');
        });
    });

    describe('Literais octais', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let interpretador: Interpretador;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        };

        beforeEach(() => {
            _saidas = [];
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        it('0o755 cria longo com valor 493', async () => {
            const codigo = ['var x = 0o755', 'escreva(x)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('493');
        });

        it('0o644 cria longo com valor 420', async () => {
            const codigo = ['escreva(0o644)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('420');
        });
    });

    describe('Função longo()', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let interpretador: Interpretador;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        };

        beforeEach(() => {
            _saidas = [];
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        it('Converte número inteiro para longo', async () => {
            const codigo = ['var x = longo(42)', 'escreva(x)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('42');
        });

        it('Converte número decimal para longo (trunca)', async () => {
            const codigo = ['escreva(longo(3.14))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('3');
        });

        it('Converte número grande além do limite de Number', async () => {
            const codigo = ['escreva(longo(9007199254740992))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('9007199254740992');
        });
    });

    describe('Operações bitwise com longo', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let interpretador: Interpretador;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        };

        beforeEach(() => {
            _saidas = [];
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        it('AND com longo preserva precisão', async () => {
            const codigo = [
                'var a = longo(4294967295)',
                'var b = longo(30)',
                'escreva(a & b)'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('30');
        });

        it('OR com longo', async () => {
            const codigo = ['escreva(0xFF | 0x0F)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('255');
        });

        it('XOR com longo', async () => {
            const codigo = ['escreva(0xFF ^ 0x0F)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('240');
        });

        it('Deslocamento à esquerda com longo - valores grandes', async () => {
            const codigo = ['escreva(longo(1) << longo(40))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('1099511627776');
        });

        it('Deslocamento à direita com longo', async () => {
            const codigo = ['escreva(longo(1024) >> longo(2))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('256');
        });

        it('Bitwise NOT com longo', async () => {
            const codigo = ['escreva(~longo(0))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('-1');
        });
    });

    describe('Operações aritméticas com longo', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let interpretador: Interpretador;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        };

        beforeEach(() => {
            _saidas = [];
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        it('Adição com longo', async () => {
            const codigo = ['escreva(longo(100) + longo(50))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('150');
        });

        it('Subtração com longo', async () => {
            const codigo = ['escreva(longo(100) - longo(30))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('70');
        });

        it('Multiplicação com longo - valores grandes', async () => {
            const codigo = ['escreva(longo(2) * longo(9007199254740991))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('18014398509481982');
        });

        it('Divisão retorna numero (decimal preciso)', async () => {
            const codigo = ['escreva(longo(7) / longo(2))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('3.5');  // Deve ser 3.5, não 3
        });

        it('Exponenciação com longo', async () => {
            const codigo = ['escreva(longo(2) ** longo(10))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('1024');
        });
    });

    describe('Operações mistas (longo com outros tipos)', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let interpretador: Interpretador;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        };

        beforeEach(() => {
            _saidas = [];
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        it('longo + inteiro auto-promove para longo', async () => {
            const codigo = ['escreva(longo(10) + 5)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('15');
        });

        it('longo & inteiro preserva precisão', async () => {
            const codigo = ['escreva(0xFFFFFFFF & 30)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('30');
        });
    });

    describe('Comparações com longo', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let interpretador: Interpretador;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        };

        beforeEach(() => {
            _saidas = [];
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        it('longo > inteiro', async () => {
            const codigo = ['escreva(longo(100) > 50)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('longo == numero', async () => {
            const codigo = ['escreva(longo(42) == 42)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('verdadeiro');
        });
    });

    describe('Tipagem longo em parâmetros e retorno de função (issue #1429)', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let interpretador: Interpretador;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        };

        beforeEach(() => {
            _saidas = [];
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        it('parâmetro anotado como longo converte argumento number para BigInt', async () => {
            const codigo = [
                'funcao dobro(n: longo): longo {',
                '    retorne n + n',
                '}',
                'escreva(dobro(9007199254740991))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            // Sem a conversão, 9007199254740991 + 9007199254740991 em Number
            // vira 18014398509481980 (perda de precisão). Com BigInt, correto.
            expect(_saidas[0]).toBe('18014398509481982');
        });

        it('retorno anotado como longo converte valor de retorno number para BigInt', async () => {
            const codigo = [
                'funcao paraLongo(n): longo {',
                '    retorne n',
                '}',
                'escreva(paraLongo(9007199254740991) + paraLongo(9007199254740991))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('18014398509481982');
        });

        it('variáveis locais sem anotação de tipo continuam Number mesmo com parâmetro/retorno longo', async () => {
            // Documenta um limite conhecido: `n: longo` e `: longo` no retorno
            // só convertem o parâmetro e o valor de retorno. Variáveis locais
            // declaradas sem anotação (`var a = 0`) não herdam o tipo da
            // função e continuam sofrendo perda de precisão.
            const codigo = [
                'funcao fibonacci(n: longo): longo {',
                '    var a = 0',
                '    var b = 1',
                '    var i = 0',
                '    enquanto i < n {',
                '        var temp = a + b',
                '        a = b',
                '        b = temp',
                '        i = i + 1',
                '    }',
                '    retorne a',
                '}',
                'escreva(fibonacci(80))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('23416728348467684'); // Esperado real: 23416728348467685
        });

        it('variáveis locais anotadas explicitamente como longo produzem resultado correto', async () => {
            const codigo = [
                'funcao fibonacci(n: longo): longo {',
                '    var a: longo = 0',
                '    var b: longo = 1',
                '    var i: longo = 0',
                '    enquanto i < n {',
                '        var temp = a + b',
                '        a = b',
                '        b = temp',
                '        i = i + 1',
                '    }',
                '    retorne a',
                '}',
                'escreva(fibonacci(80))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('23416728348467685');
        });
    });
});
