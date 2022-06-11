# Elementos de depuração

O depurador foi pensado inicialmente para funcionar com o VSCode, mas em teoria pode ser escrito para qualquer editor.

A primeira fonte de inspiração foi [um artigo do Vassili Kaplan](https://www.codemag.com/article/1809051/Writing-Your-Own-Debugger-and-Language-Extensions-with-Visual-Studio-Code), em que ele dá um exemplo para um depurador para uma linguagem chamada CSCS. A parte do cliente de depuração é implementada [na extensão dessa linguagem para o VSCode](https://github.com/DesignLiquido/delegua-vscode). Já a parte de abrir o _socket_ é encontrada em outros artigos, específicos para JavaScript, como por exemplo:

- https://zetcode.com/javascript/socket/

Você pode depurar o depurador usando o VSCode. Ele inicia juntamente com o modo REPL (LAIR). 

Uma forma bastante simples de testar o depurador é abrindo uma conexão usando o comando `nc` (Netcat), para qualquer sistema operacional:

```
nc localhost 7777
```

Isso abrirá um _socket_ entre o [Netcat](https://pt.wikipedia.org/wiki/Netcat) e a linguagem. Uma mensagem como esta irá aparecer.

> Nova conexão de cliente de ::1:49649

## Testando comandos

Os comandos implementados até então são:

- `adentrar-escopo`: conhecido em inglês como _Step Into_. De um ponto de parada (_breakpoint_), executa a instrução atual se esta não abre um bloco de escopo. Se abre, empilha o bloco e o adentra, parando na primeira instrução deste bloco;
- `adicionar-ponto-parada`: adiciona um ponto de parada (_breakpoint_) em um arquivo específico numa linha específica;
- `continuar`: de um ponto de parada (_breakpoint_), continua executando o código até 1) outro ponto de parada, ou 2) o final do programa;
- `pilha-execucao`: exibe a pilha de execução atual, com todos os escopos executados até o ponto de parada;
- `pontos-parada`: lista todos os pontos de parada;
- `proximo`: executa a instrução atual, parando na próxima instrução;
- `remover-ponto-parada`: Remove um ponto de parada (_breakpoint_) em um arquivo específico numa linha específica, se houver;
- `sair-escopo`: conhecida em inglês como _Step Out_, executa o resto do escopo atual e retorna ao escopo anterior, parando na próxima instrução. Se não houver mais instruções, finaliza a execução do programa;
- `tchau`: fecha a conexão com o servidor de depuração;
- `variáveis`: Mostra todas as variáveis instanciadas na execução atual.

`adicionar-ponto-parada` e `remover-ponto-parada` pedem dois argumentos: o caminho do arquivo fonte e a linha em que se deseja adicionar ou renover ponto de parada. Exemplo:

```
adicionar-ponto-parada ./testes/exemplos/importacao/importacao-2.egua 5
remover-ponto-parada ./testes/exemplos/importacao/importacao-2.egua 5
```