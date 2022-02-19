import { Delegua } from "./src/delegua";
import { Command } from "commander";

const principal = function () {
  const analisadorArgumentos = new Command();
  let nomeArquivo;

  analisadorArgumentos
    .option("-d, --dialeto <dialeto>", "Dialeto a ser usado. Padrão: delegua",  "delegua")
    .option("-D, --depurador", "Habilita o depurador, permitindo depuração em um ambiente como o VSCode")
    .argument('[arquivos...]', 'Nomes dos arquivos (opcional)')
    .action((arquivos) => {
        if (arquivos.length > 0) {
            nomeArquivo = arquivos[0];
        }
    });

  analisadorArgumentos.parse();
  const opcoes = analisadorArgumentos.opts();

  const delegua = new Delegua(opcoes.dialeto);

  if (!nomeArquivo) {
    delegua.iniciarDelegua(true);
  } else {
    delegua.carregarArquivo(nomeArquivo);
  }
};

principal();
