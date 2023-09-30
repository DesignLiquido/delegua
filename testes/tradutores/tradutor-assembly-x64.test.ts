import { AvaliadorSintatico } from "../../fontes/avaliador-sintatico";
import { Lexador } from "../../fontes/lexador";
import { TradutorAssemblyX64 } from '../../fontes/tradutores/tradutor-assembly-x64';

describe('Tradutor Delégua -> AssemblyX64', () => {
    const tradutor: TradutorAssemblyX64 = new TradutorAssemblyX64();

    describe('Codigo', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;

        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico()
        })

        it('escreva -> saida padrão', () => {
            const retornoLexador = lexador.mapear([
                'escreva("Olá, mundo!")',
            ], -1)

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1)

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes)

            expect(resultado).toBeTruthy();

        })

    })
})