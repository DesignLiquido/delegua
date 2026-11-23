import { AvaliadorSintaticoGuarani } from "../../../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-guarani";
import { LexadorGuarani } from "../../../../fontes/lexador/dialetos/lexador-guarani";

describe('Avaliador sintático (Guarani)', () => {
    describe('analisar()', () => {
        let lexador: LexadorGuarani;
        let avaliadorSintatico: AvaliadorSintaticoGuarani;

        beforeEach(() => {
            lexador = new LexadorGuarani();
            avaliadorSintatico = new AvaliadorSintaticoGuarani();
        });

        it('Sucesso - Olá Mundo', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'hai("Olá Mundo")'
                ],
                -1
            );
            const retornoAvaliadorSintatico =
                await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });
    });
});

describe('Avaliador sintático (Guarani) - casos adicionais', () => {
    const { obterErroDeMetodo, obterMetodosNaoImplementados } = require('../../../_auxiliares/metodos-nao-implementados');

    it.each([['hai(12.5)'], ['"texto"'], ['42']])('Analisa %s', async (codigo: string) => {
        const retorno = await new AvaliadorSintaticoGuarani().analisar(new LexadorGuarani().mapear([codigo], -1), -1);
        expect(retorno.erros).toHaveLength(0);
        expect(retorno.declaracoes).toHaveLength(1);
    });

    it('Expressão inválida', async () => {
        // O dialeto Guarani ainda não possui recuperação de erros: o erro é propagado.
        await expect(
            new AvaliadorSintaticoGuarani().analisar(new LexadorGuarani().mapear(['hai(,)'], -1), -1)
        ).rejects.toThrow('Esperado expressão.');
    });

    it.each(obterMetodosNaoImplementados(AvaliadorSintaticoGuarani.prototype))(
        '%s sinaliza que não está implementado',
        async (nomeMetodo: string) => {
            expect(await obterErroDeMetodo(new AvaliadorSintaticoGuarani(), nomeMetodo)).toContain('não implementado');
        }
    );
});
