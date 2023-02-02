import { Delegua } from './fontes/delegua';
import { Command } from 'commander';

const principal = () => {
    const analisadorArgumentos = new Command();
    let codigoOuNomeArquivo: string;

    analisadorArgumentos
        .option(
            '-c, --codigo <codigo>',
            'Código a ser avaliado.',
            ''
        )
        .option(
            '-d, --dialeto <dialeto>',
            'Dialeto a ser usado. Padrão: delegua.',
            'delegua'
        )
        .option(
            '-D, --depurador',
            'Habilita o depurador, permitindo depuração em um ambiente como o VSCode. Sempre desabilitada em modo LAIR.',
            false
        )
        .option(
            '-p, --performance',
            'Visualizar indicadores de performance. Desabilitado por padrão.',
            false
        )
        .option(
            '-s, --saida',
            'Gera arquivo de saida ao traduzir arquivo.',
            false
        )
        .option(
            '-t, --traduzir <linguagem>',
            'Traduz o código do arquivo passado como parâmetro.',
        )
        .argument('[arquivos...]', 'Nomes dos arquivos (opcional)')
        .action((argumentos) => {
            if (argumentos.length > 0) {
                codigoOuNomeArquivo = argumentos[0];
            }
        });

    analisadorArgumentos.parse();
    const opcoes = analisadorArgumentos.opts();

    const delegua = new Delegua(
        opcoes.dialeto,
        opcoes.performance,
        codigoOuNomeArquivo ? opcoes.depurador : false,
        opcoes.traduzir
    );

    if (opcoes.codigo) {
        delegua.executarCodigoComoArgumento(opcoes.codigo || codigoOuNomeArquivo);
    } else {
        if (codigoOuNomeArquivo) {
            if (opcoes.traduzir) {
                const extensaoSaida = opcoes.traduzir;
                delegua.traduzirArquivo(codigoOuNomeArquivo, opcoes.saida, extensaoSaida);
            } else {
                delegua.carregarArquivo(codigoOuNomeArquivo);
            }
        } else {
            delegua.iniciarLairDelegua();
        }
    }   
};

principal();