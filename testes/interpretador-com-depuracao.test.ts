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
});
