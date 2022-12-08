<br>
<p align="center">
  <img src="./recursos/imagens/icone-delegua.png" alt="delegua" width="auto" height="130px">
  <h3 align="center">Linguagem Delégua</h3>

  <p align="center">
    Linguagem de programação, derivada da <a href="https://egua.tech/docs/egua" target="_blank">Linguagem Égua</a>
    <br />
    <a href="https://designliquido.github.io/delegua-web/" target="_blank">Página Web com Interpretador Delégua para demonstrações</a>
  </p>

  <p align="center">
    <a href="https://github.com/DesignLiquido/delegua/issues" target="_blank"><img src="https://img.shields.io/github/issues/Designliquido/delegua" /></a>
    <img src="https://img.shields.io/github/stars/Designliquido/delegua" />
    <img src="https://img.shields.io/github/forks/Designliquido/delegua" />
    <a href="https://www.npmjs.com/package/@designliquido/delegua" target="_blank"><img src="https://img.shields.io/npm/v/@designliquido/delegua" /></a>
    <img src="https://img.shields.io/github/license/Designliquido/delegua" />
    <br>
  </p>

  <p align="center">
    Acompanhe a Design Líquido nas redes sociais:<br />
    <a href="https://twitter.com/designliquido" target="_blank"> <img src="https://img.shields.io/badge/-Twitter-1ca0f1?style=flat&labelColor=1ca0f1&logo=twitter&logoColor=white&link=Twitter" /></a>
    <a href="https://www.instagram.com/design.liquido" target="_blank"><img src="https://img.shields.io/badge/-Instagram-c13584?style=flat&labelColor=c13584&logo=instagram&logoColor=white" /></a>
    <a href="https://www.youtube.com/channel/UCJRn3B7r0aex6LCaOyrQtZQ" target="_blank"><img src="https://img.shields.io/badge/-YouTube-ff0000?style=flat-square&labelColor=ff0000&logo=youtube&logoColor=white" /></a>
    <a href="https://www.linkedin.com/company/design-liquido" target="_blank"><img src="https://img.shields.io/badge/-LinkedIn-blue?style=flat&logo=Linkedin&logoColor=white" /></a>
    <a href="https://www.tiktok.com/@designliquido" target="_blank"><img src="https://img.shields.io/static/v1?style=for-the-badge&message=TikTok&color=black&logo=TikTok&logoColor=white&label=" /></a>
  </p>
</p>

## Introdução

Delégua é uma variação da linguagem Égua, usada para fins educacionais e comerciais pela Design Líquido. A variação começou na versão 1.2.0 de Égua.

Delégua tem retrocompatibilidade com a linguagem Égua e compreende sua extensão de arquivo (`.egua`). Em outras palavras, todo programa escrito em Égua funciona em Delégua, mas Delégua tem capacidades a mais, [conforme mencionado em documentação](https://github.com/DesignLiquido/delegua/wiki).

## Características

- **Simples e Completa.** Podendo ser usada por pessoas com ou sem experiência em programação.
- **Totalmente em Português.** Desenvolvida totalmente em português para quebrar a barreira do inglês.
- **Grátis.** Sem planos, sem limitações e sem propaganda.
- **Código aberto (open source).** Todo o código fonte disponível para estudar, modificar e contribuir.
- **Linguagem Científica.** Apoiamos e encorajamos o desenvolvimento e aprimoramento da ciência e da educação.

## Instalação

Delégua executa em qualquer dispositivo que interprete JavaScript, ou seja, computadores, celulares e tablets. Você não precisa instalar nada se não quiser: [basta usar nosso editor online clicando aqui](https://designliquido.github.io/delegua-web/).

Se quiser instalar no seu computador,
[você deve ter antes o Node.js instalado em seu ambiente](https://dicasdejavascript.com.br/instalacao-do-nodejs-e-npm-no-windows-passo-a-passo).

Com o Node.js instalado, execute o seguinte comando em um prompt de comando (Terminal, PowerShell ou `cmd` no Windows, Terminal ou `bash` em Mac e Linux):

```
npm install -g delegua
```

### Usando como LAIR (Leia-Avalie-Imprima-Repita) em console

Feita a instalação no seu ambiente, execute o seguinte comando:

```
delegua
```

Você terá um interpretador Delégua que avalia expressões linha a linha.

Um exemplo de uso é como uma calculadora:

```js
delegua> 2 + 2
4

delegua> 2 * 3
6

delegua> 2 ** 10
1024
```

Para finalizar a execução do interpretador LAIR Delégua, use o atalho <key>Ctrl</key> + <key>C</key> (todos os sistemas operacionais).

### Executando arquivos

É possível usar o interpretador com outros dialetos, como Égua.

```
delegua --dialeto egua
```

[Veja aqui todos os dialetos suportados](https://github.com/DesignLiquido/delegua/wiki/Dialetos).

Se não quiser instalar as bibliotecas que acompanham Delégua, apenas o núcleo da linguagem pode ser instalado:

```
npm install -g @designliquido/delegua
```

## Documentação

- [Delégua é documentada na Wiki deste GitHub](https://github.com/DesignLiquido/delegua/wiki).
- Para acessar a documentação da linguagem Égua, visite https://egua.tech/docs.

## Contribuições e Comunidade

* Para contribuições, por favor, leia o nosso [Guia de Contribuição](.github/CONTRIBUTING.md) antes de submeter uma _Pull Request_.
* [Veja nossas discussões atuais](https://github.com/DesignLiquido/delegua/discussions).
* [Temos um grupo no Discord](https://discord.gg/4tBxWSSbdV).
