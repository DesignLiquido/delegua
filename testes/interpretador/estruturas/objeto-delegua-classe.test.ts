import { DescritorTipoClasse, ObjetoDeleguaClasse } from '../../../fontes/interpretador/estruturas';

describe('ObjetoDeleguaClasse', () => {
    const criarObjeto = () => {
        const classe = new DescritorTipoClasse({ lexema: 'Pessoa' } as any, [], {}, []);
        const objeto = new ObjetoDeleguaClasse(classe);
        objeto.propriedades['nome'] = 'Ana';
        return objeto;
    };

    it('paraTexto() e toString()', () => {
        const objeto = criarObjeto();
        expect(objeto.paraTexto()).toBe('<[ Pessoa métodos=[] propriedades=[nome] ]>');
        expect(String(objeto)).toBe(objeto.paraTexto());
    });

    it('obterPropriedade() existente e inexistente', () => {
        const objeto = criarObjeto();
        expect(objeto.obterPropriedade('nome')).toBe('Ana');
        expect(() => objeto.obterPropriedade('idade')).toThrow('Propriedade "idade" não existe neste objeto.');
    });

    it('obterMetodo() inexistente', () => {
        expect(() => criarObjeto().obterMetodo('falar')).toThrow('Método "falar" não existe neste objeto.');
    });

    it('obter() de propriedade somente-escrita', async () => {
        const classe = new DescritorTipoClasse({ lexema: 'A' } as any, [], {}, [
            { nome: { lexema: 'segredo' }, autoDefinir: true, autoObter: false } as any,
        ]);
        const objeto = new ObjetoDeleguaClasse(classe);
        await expect(objeto.obter({ lexema: 'segredo' } as any)).rejects.toThrow(
            "Propriedade 'segredo' é somente-escrita."
        );
    });
});
