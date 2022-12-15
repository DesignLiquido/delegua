import { Delegua } from './fontes/delegua';
import { Command } from 'commander';

const principal = () => {
    const analisadorArgumentos = new Command();
    let nomeArquivo: string;

    analisadorArgumentos
        .option(
            '-d, --dialeto <dialeto>',
            'Dialeto a ser usado. Padrão: delegua',
            'delegua'
        )
        .option(
            '-D, --depurador',
            'Habilita o depurador, permitindo depuração em um ambiente como o VSCode. Sempre desabilitada em modo LAIR.',
            false
        )
        .option(
            '-p, --performance',
            'Visualizar indicadores de performance. Desabilitado por padrão',
            false
        )
        .option(
            '-t, --traduzir <linguagem>',
            'Traduz o código do arquivo passado como parâmetro',
        )
        .option(
            '-s, --saida',
            'Gera arquivo de saida ao traduzir arquivo',
            false
        )
        .argument('[arquivos...]', 'Nomes dos arquivos (opcional)')
        .action((arquivos) => {
            if (arquivos.length > 0) {
                nomeArquivo = arquivos[0];
            }
        });

    analisadorArgumentos.parse();
    const opcoes = analisadorArgumentos.opts();

    const delegua = new Delegua(
        opcoes.dialeto,
        opcoes.performance,
        nomeArquivo ? opcoes.depurador : false,
        opcoes.traduzir
    );

    if (!nomeArquivo) {
        delegua.iniciarLairDelegua();
    } else if (opcoes.traduzir) {
        delegua.traduzirArquivo(nomeArquivo, opcoes.saida);
    } else {
        delegua.carregarArquivo(nomeArquivo);
    }
};

principal();