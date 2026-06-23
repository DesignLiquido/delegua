import { DescritorTipoClasse } from './descritor-tipo-classe';
import { DeleguaFuncaoNativa } from './delegua-funcao-nativa';
import { OBJETO_BASE } from './objeto-base';

const simboloExcecao: any = {
    tipo: 'IDENTIFICADOR',
    lexema: 'Excecao',
    literal: null,
    linha: 0,
    hashArquivo: -1,
};

function criarDescritorExcecao(): DescritorTipoClasse {
    const descritor = new DescritorTipoClasse(simboloExcecao, OBJETO_BASE, {});

    descritor.metodos['construtor'] = new DeleguaFuncaoNativa('construtor', 1, (instancia, args) => {
        if (instancia) {
            instancia.propriedades['mensagem'] = args[0] ?? null;
        }
    });

    descritor.metodos['paraTexto'] = new DeleguaFuncaoNativa('paraTexto', 0, (instancia) => {
        return String(instancia?.propriedades['mensagem'] ?? '');
    });

    descritor.orem = DescritorTipoClasse.computarOReM(descritor);
    return descritor;
}

export const EXCECAO_BASE: DescritorTipoClasse = criarDescritorExcecao();
