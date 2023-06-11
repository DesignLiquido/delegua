import { AvaliadorSintatico } from "../fontes/avaliador-sintatico";
import { InterpretadorComDepuracao } from "../fontes/interpretador";
import { Lexador } from "../fontes/lexador";

describe('Interpretador com suporte a depuração', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;
    let interpretador: InterpretadorComDepuracao;

    beforeEach(() => {
        jest.clearAllMocks();
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
        interpretador = new InterpretadorComDepuracao(
            process.cwd(),
            console.log,
            console.log
        );
        interpretador.finalizacaoDaExecucao = () => {};
    });

    describe('instrucaoContinuarInterpretacao()', () => {
        it('Trivial', async () => {
            const retornoLexador = lexador.mapear([
                "escreva('Olá mundo')"
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            interpretador.prepararParaDepuracao(
                retornoAvaliadorSintatico.declaracoes
            );

            jest.spyOn(InterpretadorComDepuracao.prototype, 'executar');
            
            await interpretador.instrucaoContinuarInterpretacao();
            expect(InterpretadorComDepuracao.prototype.executar).toHaveBeenCalledTimes(1);
        });

        it('Enquanto', async () => {
            const retornoLexador = lexador.mapear([
                "var a = 1",
                "enquanto (a < 10) {",
                "    a += 1",
                "}"
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            interpretador.prepararParaDepuracao(
                retornoAvaliadorSintatico.declaracoes
            );

            jest.spyOn(InterpretadorComDepuracao.prototype, 'executar');
            
            await interpretador.instrucaoContinuarInterpretacao();
            expect(InterpretadorComDepuracao.prototype.executar).toHaveBeenCalledTimes(2);
        });
    });

    describe('instrucaoPasso()', () => {
        it('Trivial', async () => {
            const retornoLexador = lexador.mapear([
                "escreva('Olá mundo')"
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            interpretador.prepararParaDepuracao(
                retornoAvaliadorSintatico.declaracoes
            );

            jest.spyOn(InterpretadorComDepuracao.prototype, 'executar');
            
            await interpretador.instrucaoPasso();
            expect(InterpretadorComDepuracao.prototype.executar).toHaveBeenCalledTimes(1);
        });

        it('Enquanto', async () => {
            const retornoLexador = lexador.mapear([
                "var a = 1",
                "enquanto (a < 10) {",
                "    a += 1",
                "    escreva(a)",
                "}"
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            interpretador.prepararParaDepuracao(
                retornoAvaliadorSintatico.declaracoes
            );

            jest.spyOn(InterpretadorComDepuracao.prototype, 'executar');
            
            interpretador.comando = 'proximo';
            await interpretador.instrucaoPasso(); // var a = 1
            await interpretador.instrucaoPasso(); // empilha enquanto (a < 10)
            await interpretador.instrucaoPasso(); // executa enquanto (a < 10), a == 1
            await interpretador.instrucaoPasso(); // executa a += 1, a == 2
            await interpretador.instrucaoPasso(); // escreva(a)
            await interpretador.instrucaoPasso(); // executa enquanto (a < 10), a == 2
            await interpretador.instrucaoPasso(); // executa executa a += 1, a == 3
            await interpretador.instrucaoPasso(); // escreva(a)
            await interpretador.instrucaoPasso(); // executa enquanto (a < 10), a == 3
            await interpretador.instrucaoPasso(); // executa executa a += 1, a == 4
            await interpretador.instrucaoPasso(); // escreva(a)
            await interpretador.instrucaoPasso(); // executa enquanto (a < 10), a == 4
            await interpretador.instrucaoPasso(); // executa executa a += 1, a == 5
            await interpretador.instrucaoPasso(); // escreva(a)
            await interpretador.instrucaoPasso(); // executa enquanto (a < 10), a == 5
            await interpretador.instrucaoPasso(); // executa executa a += 1, a == 6
            await interpretador.instrucaoPasso(); // escreva(a)
            await interpretador.instrucaoPasso(); // executa enquanto (a < 10), a == 6
            await interpretador.instrucaoPasso(); // executa executa a += 1, a == 7
            await interpretador.instrucaoPasso(); // escreva(a)
            await interpretador.instrucaoPasso(); // executa enquanto (a < 10), a == 7
            await interpretador.instrucaoPasso(); // executa executa a += 1, a == 8
            await interpretador.instrucaoPasso(); // escreva(a)
            await interpretador.instrucaoPasso(); // executa enquanto (a < 10), a == 8
            await interpretador.instrucaoPasso(); // executa executa a += 1, a == 9
            await interpretador.instrucaoPasso(); // escreva(a)
            await interpretador.instrucaoPasso(); // executa enquanto (a < 10), a == 9
            await interpretador.instrucaoPasso(); // executa executa a += 1, a == 10
            await interpretador.instrucaoPasso(); // escreva(a)
            expect(InterpretadorComDepuracao.prototype.executar).toHaveBeenCalledTimes(29);
        });

        it('Enquanto, pré-condição nunca satisfeita', async () => {
            const retornoLexador = lexador.mapear([
                "var a = 10",
                "enquanto a < 10 {",
                "    a += 1",
                "    escreva(a)",
                "}"
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            interpretador.prepararParaDepuracao(
                retornoAvaliadorSintatico.declaracoes
            );

            jest.spyOn(InterpretadorComDepuracao.prototype, 'executar');
            
            interpretador.comando = 'proximo';
            await interpretador.instrucaoPasso(); // var a = 10
            await interpretador.instrucaoPasso(); // empilha enquanto (a < 10)
            await interpretador.instrucaoPasso(); // executa enquanto (a < 10), a == 10, escopo não é executado.
            expect(InterpretadorComDepuracao.prototype.executar).toHaveBeenCalledTimes(3);
        });
    });
});
