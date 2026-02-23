import { DescritorTipoClasse } from './descritor-tipo-classe';
import { DeleguaFuncaoNativa } from './delegua-funcao-nativa';

const simboloObjeto: any = {
    tipo: 'IDENTIFICADOR',
    lexema: 'Objeto',
    literal: null,
    linha: 0,
    hashArquivo: -1,
};

function criarDescritorObjeto(): DescritorTipoClasse {
    const descritor = new DescritorTipoClasse(simboloObjeto, null, {});

    descritor.metodos['paraTexto'] = new DeleguaFuncaoNativa('paraTexto', 0, (instancia) => {
        const nome = instancia?.classe?.simboloOriginal?.lexema ?? 'Objeto';
        const nomesMetodos = Object.keys(instancia?.classe?.metodos ?? {}).join(', ');
        const nomesPropriedades = Object.keys(instancia?.propriedades ?? {}).join(', ');
        return `<[ ${nome} métodos=[${nomesMetodos}] propriedades=[${nomesPropriedades}] ]>`;
    });

    descritor.metodos['tipo'] = new DeleguaFuncaoNativa('tipo', 0, (instancia) => {
        return instancia?.classe?.simboloOriginal?.lexema ?? 'Objeto';
    });

    descritor.metodos['igual'] = new DeleguaFuncaoNativa('igual', 1, (instancia, args) => {
        return instancia === args[0];
    });

    descritor.metodos['eInstanciaDe'] = new DeleguaFuncaoNativa(
        'eInstanciaDe',
        1,
        (instancia, args) => {
            if (!instancia) return false;
            const classeAlvo = args[0];
            if (!(classeAlvo instanceof DescritorTipoClasse)) return false;
            let cls: DescritorTipoClasse = instancia.classe;
            while (cls) {
                if (cls === classeAlvo) return true;
                cls = cls.superClasse;
            }
            return false;
        }
    );

    descritor.metodos['metodos'] = new DeleguaFuncaoNativa('metodos', 0, (instancia) => {
        if (!instancia) return [];
        const nomes: string[] = [];
        let cls: DescritorTipoClasse = instancia.classe;
        while (cls) {
            for (const nome of Object.keys(cls.metodos)) {
                if (!nomes.includes(nome)) nomes.push(nome);
            }
            cls = cls.superClasse;
        }
        return nomes;
    });

    descritor.metodos['propriedades'] = new DeleguaFuncaoNativa('propriedades', 0, (instancia) => {
        if (!instancia) return [];
        return Object.keys(instancia.propriedades);
    });

    descritor.metodos['respondeA'] = new DeleguaFuncaoNativa('respondeA', 1, (instancia, args) => {
        if (!instancia) return false;
        const nome = String(args[0]);
        return instancia.classe.encontrarMetodo(nome) !== undefined;
    });

    return descritor;
}

export const OBJETO_BASE: DescritorTipoClasse = criarDescritorObjeto();
