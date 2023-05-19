import { LexadorPotigol } from "../../fontes/lexador/dialetos";

describe('Lexador (Potigol)', () => {
    describe('mapear()', () => {
        let lexador: LexadorPotigol;

        beforeEach(() => {
            lexador = new LexadorPotigol();
        });

        describe('Cenário de sucesso', () => {
            it('Arquivo vazio.', () => {
                const resultado = lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Olá mundo', () => {
                const resultado = lexador.mapear([
                    'escreva "Olá Mundo"'
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(2);
            });
        });
    });
});
