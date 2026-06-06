import { ObjetoPadrao } from '../../../fontes/interpretador/estruturas';

describe('ObjetoPadrao', () => {
    it('construtor define classePadrao', () => {
        const obj = new ObjetoPadrao('MinhaClasse');
        expect(obj.classePadrao).toBe('MinhaClasse');
    });

    it('paraTexto() inclui nome da classe e tags', () => {
        const obj = new ObjetoPadrao('MinhaClasse');
        const texto = obj.paraTexto();
        expect(texto).toContain('MinhaClasse');
        expect(texto).toContain('<objeto-padrão');
        expect(texto).toContain('</objeto-padrão>');
    });

    it('paraTexto() lista propriedades adicionais', () => {
        const obj = new ObjetoPadrao('Pessoa') as any;
        obj.nome = 'João';
        const texto = obj.paraTexto();
        expect(texto).toContain('nome');
        expect(texto).toContain('João');
    });

    it('toString() retorna o mesmo que paraTexto()', () => {
        const obj = new ObjetoPadrao('Teste');
        expect(obj.toString()).toBe(obj.paraTexto());
    });
});
