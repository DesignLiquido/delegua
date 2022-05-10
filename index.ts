import { Delegua } from "./fontes/delegua";
import { Command } from "commander";

const texto = (msg: String, v: Array<any>) => {
    // console.log('v', v)
    // console.log('sa >> ', v.join('\n'))
    // console.log('sa >> ', msg)
}

const principal = () => {
    const analisadorArgumentos = new Command();
    let nomeArquivo: string;

    analisadorArgumentos
        .option("-d, --dialeto <dialeto>", "Dialeto a ser usado. Padrão: delegua", "delegua")
        .option("-p, --performance", "Visualizar indicadores de performance. Desabilitado por padrão", false)
        .argument('[arquivos...]', 'Nomes dos arquivos (opcional)')
        .action((arquivos) => {
            if (arquivos.length > 0) {
                nomeArquivo = arquivos[0];
            }
        });

    analisadorArgumentos.parse();
    const opcoes = analisadorArgumentos.opts();

    const delegua = new Delegua(opcoes.dialeto, opcoes.performance, '', texto);

    if (!nomeArquivo) {
        delegua.iniciarDelegua();
    } else {
        delegua.carregarArquivo(nomeArquivo);
    }
};

principal();
