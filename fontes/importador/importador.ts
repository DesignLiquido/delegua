import * as fs from 'fs';
import * as caminho from 'path';

import cyrb53 from '../depuracao/cyrb53';
import { ErroEmTempoDeExecucao } from '../excecoes';
import { AvaliadorSintaticoInterface, LexadorInterface } from '../interfaces';

import { ImportadorInterface } from "../interfaces/importador-interface";
import { RetornoImportador } from './retorno-importador';

/**
 * O Importador é responsável por manusear arquivos. Coordena as fases de lexação, avaliação sintática, 
 * cataloga informações do arquivo no núcleo da linguagem (através das referências `arquivosAbertos` e 
 * `conteudoArquivosAbertos`) e aponta erros caso ocorram.
 * 
 */
export class Importador implements ImportadorInterface {
    lexador: LexadorInterface;
    avaliadorSintatico: AvaliadorSintaticoInterface;
    arquivosAbertos: { [identificador: string]: string };
    conteudoArquivosAbertos: { [identificador: string]: string[] };
    depuracao: boolean;

    constructor(
        lexador: LexadorInterface, 
        avaliadorSintatico: AvaliadorSintaticoInterface, 
        arquivosAbertos: { [identificador: string]: string },
        conteudoArquivosAbertos: { [identificador: string]: string[] },
        depuracao: boolean) 
    {
        this.lexador = lexador;
        this.avaliadorSintatico = avaliadorSintatico;
        this.arquivosAbertos = arquivosAbertos;
        this.conteudoArquivosAbertos = conteudoArquivosAbertos;
        this.depuracao = depuracao;
    }

    importar(caminhoRelativoArquivo: string): RetornoImportador {
        const nomeArquivo = caminho.basename(caminhoRelativoArquivo);
        const caminhoAbsolutoArquivo = caminho.resolve(caminhoRelativoArquivo);
        const hashArquivo = cyrb53(caminhoAbsolutoArquivo.toLowerCase());

        if (!fs.existsSync(nomeArquivo)) {
            // TODO: Terminar.
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
        this.arquivosAbertos[hashArquivo] = caminho.resolve(caminhoRelativoArquivo);

        if (this.depuracao) {
            this.conteudoArquivosAbertos[hashArquivo] = conteudoDoArquivo;
        }
        
        return {
            nomeArquivo,
            hashArquivo,
            retornoLexador,
            retornoAvaliadorSintatico
        } as RetornoImportador;
    }
}