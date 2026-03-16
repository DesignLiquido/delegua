import { AvaliadorSintaticoCalango } from "../../../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-calango";
import { LexadorCalango } from "../../../../fontes/lexador/dialetos";

describe('Avaliador sintático (Calango)', () => {
    describe('analisar()', () => {
        let lexador: LexadorCalango;
        let avaliadorSintatico: AvaliadorSintaticoCalango;

        beforeEach(() => {
            lexador = new LexadorCalango();
            avaliadorSintatico = new AvaliadorSintaticoCalango();
        });

        it('Sucesso - escreva()', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;', 
                'principal', 
                'escreva("Ola Mundo");',
                'fimPrincipal'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Sucesso - escreval()', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;', 
                'principal', 
                // Essa forma de escrita eu testei em Calango e funciona tranquilamente (linha 44)
                'escreval("Ola Mundo"); escreva("nova linha");', 
                'fimPrincipal'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });

        it('Sucesso - Atribuindo variáveis', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;', 
                'principal', 
                'inteiro idade;',
                'idade = 0;',
                'escreval(idade)', 
                'fimPrincipal'
            ], -1);
            
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
        });

        // TODO @Maitê: Corrigir.
        it.skip('Sucesso - Condicionais (se, senao)', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo tituloDoAlgoritmo;', 
                'principal', 
                'inteiro idade;', 
                'escreva("Informe sua idade: ");',
                'leia(idade);',
                'se (idade >= 18) entao',
                    'escreval("maior de idade");',
                'senao',
                    'se (idade <= 0) entao',
                        'escreval("valor invalido");',
                    'senao',
                        'escreval("menor de idade");',
                    'fimSe',
                'fimSe',
                'fimPrincipal'
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
        });
    });
});
