import * as fs from 'fs';
import * as caminho from 'path';
import { AvaliadorSintaticoInterface, LexadorInterface } from '../interfaces';

import { ImportadorInterface } from "../interfaces/importador-interface";
import { RetornoImportador } from './retorno-importador';

export class Importador implements ImportadorInterface {
    lexador: LexadorInterface;
    avaliadorSintatico: AvaliadorSintaticoInterface;

    constructor(lexador: LexadorInterface, avaliadorSintatico: AvaliadorSintaticoInterface) {
        this.lexador = lexador;
        this.avaliadorSintatico = avaliadorSintatico;
    }

    importar(caminhoRelativoArquivo: string): RetornoImportador {
        const nomeArquivo = caminho.basename(caminhoRelativoArquivo);

        const dadosDoArquivo: Buffer = fs.readFileSync(caminhoRelativoArquivo);
        const conteudoDoArquivo: string[] = dadosDoArquivo
            .toString()
            .split('\n');

        const retornoLexador = this.lexador.mapear(conteudoDoArquivo);
        const retornoAvaliadorSintatico = this.avaliadorSintatico.analisar(retornoLexador);
        
        return {
            nomeArquivo,
            codigo: conteudoDoArquivo,
            retornoLexador,
            retornoAvaliadorSintatico
        } as RetornoImportador;
    }
}