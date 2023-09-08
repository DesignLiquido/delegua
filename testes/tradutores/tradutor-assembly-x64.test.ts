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
            expect(resultado).toMatch(/section \.bss/);
            expect(resultado).toMatch(/section \.data/);
            expect(resultado).toMatch(/Delegua_\d+ db 'Olá, mundo!', 0/);
            expect(resultado).toMatch(/tam_Delegua_\d+ equ \$ - Delegua_\d+/);
            expect(resultado).toMatch(/section \.text/);
            expect(resultado).toMatch(/global _start/);
            expect(resultado).toMatch(/mov edx, tam_Delegua_\d+/);
            expect(resultado).toMatch(/mov ecx, Delegua_\d+/);
            expect(resultado).toMatch(/mov ebx, 1/);
            expect(resultado).toMatch(/mov eax, 4/);
            expect(resultado).toMatch(/int 0x80/);
            expect(resultado).toMatch(/mov eax, 1/);
            expect(resultado).toMatch(/int 0x80/);
        })
        it.only('leia -> saida padrão', () => {
            const retornoLexador = lexador.mapear([
                'leia()',
            ], -1)

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, 1)

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes)

            expect(resultado).toBeTruthy();
        })
    })
})