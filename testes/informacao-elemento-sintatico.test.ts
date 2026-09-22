import { InformacaoElementoSintatico } from '../fontes/informacao-elemento-sintatico';

describe('InformacaoElementoSintatico', () => {
    it('deve gerar texto com subelementos', () => {
        const filho = new InformacaoElementoSintatico('filho', 'texto', false, [], 'documentacao filho');
        const pai = new InformacaoElementoSintatico('pai', 'objeto', true, [filho], 'documentacao pai');

        const texto = pai.toString();
        expect(texto).toContain('informação-elemento-sintático');
        expect(texto).toContain('nome=pai');
        expect(texto).toContain('obrigatório=verdadeiro');
        expect(texto).toContain('nome=filho');
    });

    it('deve respeitar obrigatoriedade falsa', () => {
        const elemento = new InformacaoElementoSintatico('item', 'numero', false);
        expect(elemento.toString()).toContain('obrigatório=falso');
    });
});
