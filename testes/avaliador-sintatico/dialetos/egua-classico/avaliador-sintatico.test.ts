import { AvaliadorSintaticoEguaClassico } from "../../../../fontes/avaliador-sintatico/dialetos";
import { SimboloInterface } from "../../../../fontes/interfaces";
import { RetornoLexadorInterface } from "../../../../fontes/interfaces/retornos/retorno-lexador-interface";
import { LexadorEguaClassico } from "../../../../fontes/lexador/dialetos";

describe('Avaliador sintático (Égua Clássico)', () => {
    describe('analisar()', () => {
        let lexador: LexadorEguaClassico;
        let avaliadorSintatico: AvaliadorSintaticoEguaClassico;

        beforeEach(() => {
            lexador = new LexadorEguaClassico();
            avaliadorSintatico = new AvaliadorSintaticoEguaClassico();
        });

        it('Sucesso - Olá Mundo', async () => {
            const retornoLexador = lexador.mapear(["escreva('Olá mundo');"]);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
        });

        it('Falha - Vetor vazio', async () => {
            await expect(avaliadorSintatico.analisar({ simbolos: [] } as any as RetornoLexadorInterface<SimboloInterface>, -1)).rejects.toThrow(TypeError);
        });

        it('Falha - Undefined', async () => {
            await expect(avaliadorSintatico.analisar(undefined as any, -1)).rejects.toThrow(TypeError);
        });

        it('Falha - Null', async () => {
            await expect(avaliadorSintatico.analisar(null as any, -1)).rejects.toThrow(TypeError);
        });
    });
});
describe('Avaliador sintático (Égua Clássico) - erros adicionais', () => {
    it.each([
        ['classe A herda B { m() { retorna super.; } }', "Esperado nome do método após '.'."],
        ['escreva(+);', 'Esperado expressão.'],
        ['1 = 2;', 'Tarefa de atribuição inválida'],
        [
            'escolha (1) { padrão: escreva(1); padrão: escreva(2); }',
            "Você só pode ter um 'padrao' em cada declaração de 'escolha'.",
        ],
    ])('Erro em %s', async (codigo: string, mensagem: string) => {
        const retorno = await new AvaliadorSintaticoEguaClassico().analisar(new LexadorEguaClassico().mapear([codigo]), -1);
        expect(retorno.erros.map((erro) => erro.message).some((m) => m.includes(mensagem))).toBe(true);
    });
});
