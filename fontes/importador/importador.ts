import * as fs from 'fs';
import * as caminho from 'path';
import cyrb53 from '../depuracao/cyrb53';
import { ErroEmTempoDeExecucao } from '../excecoes';
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
        const hashArquivo = cyrb53(caminhoRelativoArquivo);
        // this.arquivosAbertos[hashArquivo] = caminho.resolve(caminhoRelativoArquivo);

        if (!fs.existsSync(nomeArquivo)) {
            /* throw new ErroEmTempoDeExecucao(
                declaracao.simboloFechamento,
                'Não foi possível encontrar arquivo importado.',
                declaracao.linha
            ); */
        }

        const dadosDoArquivo: Buffer = fs.readFileSync(caminhoRelativoArquivo);
        const conteudoDoArquivo: string[] = dadosDoArquivo
            .toString()
            .split('\n');

        const retornoLexador = this.lexador.mapear(conteudoDoArquivo, hashArquivo);
        const retornoAvaliadorSintatico = this.avaliadorSintatico.analisar(retornoLexador, hashArquivo);
        
        return {
            nomeArquivo,
            hashArquivo,
            codigo: conteudoDoArquivo,
            retornoLexador,
            retornoAvaliadorSintatico
        } as RetornoImportador;
    }
}