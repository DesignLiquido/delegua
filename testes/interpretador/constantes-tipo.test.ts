import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Interpretador } from '../../fontes/interpretador';
import { Lexador } from '../../fontes/lexador';

describe('Constantes de tipo', () => {
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

    describe('inteiro', () => {
        it('inteiro.MAXIMO retorna 2147483647', async () => {
            const retornoLexador = lexador.mapear(['escreva(inteiro.MAXIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('2147483647');
        });

        it('inteiro.MÁXIMO retorna 2147483647', async () => {
            const retornoLexador = lexador.mapear(['escreva(inteiro.MÁXIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('2147483647');
        });

        it('inteiro.MINIMO retorna -2147483648', async () => {
            const retornoLexador = lexador.mapear(['escreva(inteiro.MINIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('-2147483648');
        });

        it('inteiro.MÍNIMO retorna -2147483648', async () => {
            const retornoLexador = lexador.mapear(['escreva(inteiro.MÍNIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('-2147483648');
        });
    });

    describe('longo', () => {
        it('longo.MAXIMO retorna 9223372036854775807', async () => {
            const retornoLexador = lexador.mapear(['escreva(longo.MAXIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('9223372036854775807');
        });

        it('longo.MÁXIMO retorna 9223372036854775807', async () => {
            const retornoLexador = lexador.mapear(['escreva(longo.MÁXIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('9223372036854775807');
        });

        it('longo.MINIMO retorna -9223372036854775808', async () => {
            const retornoLexador = lexador.mapear(['escreva(longo.MINIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('-9223372036854775808');
        });

        it('longo.MÍNIMO retorna -9223372036854775808', async () => {
            const retornoLexador = lexador.mapear(['escreva(longo.MÍNIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('-9223372036854775808');
        });
    });

    describe('numero', () => {
        it('numero.MAXIMO retorna Number.MAX_VALUE', async () => {
            const retornoLexador = lexador.mapear(['escreva(numero.MAXIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe(String(Number.MAX_VALUE));
        });

        it('número.MÁXIMO retorna Number.MAX_VALUE', async () => {
            const retornoLexador = lexador.mapear(['escreva(número.MÁXIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe(String(Number.MAX_VALUE));
        });

        it('numero.MINIMO retorna -Number.MAX_VALUE', async () => {
            const retornoLexador = lexador.mapear(['escreva(numero.MINIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe(String(-Number.MAX_VALUE));
        });

        it('número.MÍNIMO retorna -Number.MAX_VALUE', async () => {
            const retornoLexador = lexador.mapear(['escreva(número.MÍNIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe(String(-Number.MAX_VALUE));
        });
    });

    describe('real', () => {
        it('real.MAXIMO retorna Number.MAX_VALUE', async () => {
            const retornoLexador = lexador.mapear(['escreva(real.MAXIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe(String(Number.MAX_VALUE));
        });

        it('real.MÍNIMO retorna -Number.MAX_VALUE', async () => {
            const retornoLexador = lexador.mapear(['escreva(real.MÍNIMO)'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas[0]).toBe(String(-Number.MAX_VALUE));
        });
    });
});
