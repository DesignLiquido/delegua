# Elementos de depuração

O depurador foi pensado inicialmente para funcionar com o VSCode, mas em teoria pode ser escrito para qualquer editor.

A primeira fonte de inspiração foi [um artigo do Vassili Kaplan](https://www.codemag.com/article/1809051/Writing-Your-Own-Debugger-and-Language-Extensions-with-Visual-Studio-Code), em que ele dá um exemplo para um depurador para uma linguagem chamada CSCS. A parte do cliente de depuração é implementada [na extensão dessa linguagem para o VSCode](https://github.com/DesignLiquido/delegua-vscode). Já a parte de abrir o socket é encontrada em outros artigos, específicos para JavaScript, como por exemplo:

- https://zetcode.com/javascript/socket/

Você pode depurar o depurador usando o VSCode. 

Uma forma bastante simples de testar o depurador é abrindo uma conexão usando o comando `nc` (Netcat), para qualquer sistema operacional:

```
nc localhost 7777
```