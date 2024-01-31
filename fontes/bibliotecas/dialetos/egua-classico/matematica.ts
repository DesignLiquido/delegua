/* eslint-disable prefer-rest-params */
import { ErroEmTempoDeExecucao } from '../../../excecoes';

module.exports.graus = function (angle) {
    const valorAngle = angle.hasOwnProperty('valor') ? angle.valor : angle;
    if (isNaN(valorAngle) || valorAngle === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover um número para mat.graus(ângulo).');

    return valorAngle * (180 / Math.PI);
};

module.exports.mediana = function (a) {
    if (isNaN(a) || a === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para mediana(a).');

    a.sort(function (a, b) {
        return a - b;
    });
    const mid = a.length / 2;
    return mid % 1 ? a[mid - 0.5] : (a[mid - 1] + a[mid]) / 2;
};

/**
 * Calcula a moda de um vetor.
 * @param {inteiro[]} vetor Vetor de inteiros.
 * @returns Valor inteiro da moda.
 */
module.exports.moda = function (numbers) {
    if (!Array.isArray(numbers))
        throw new ErroEmTempoDeExecucao(this.token, 'Parâmetro `vetor` deve ser um vetor na função moda(vetor).');

    if (numbers.some(isNaN))
        throw new ErroEmTempoDeExecucao(
            this.token,
            'Todos os elementos de `vetor` deve ser numéricos na função moda(vetor).'
        );

    let modes = [],
        count = [],
        i,
        number,
        maxIndex = 0;

    for (i = 0; i < numbers.length; i += 1) {
        number = numbers[i];
        count[number] = (count[number] || 0) + 1;
        if (count[number] > maxIndex) {
            maxIndex = count[number];
        }
    }

    for (i in count)
        if (count.hasOwnProperty(i)) {
            if (count[i] === maxIndex) {
                modes.push(Number(i));
            }
        }

    return modes;
};

module.exports.pi = Math.PI;

module.exports.radiano = function (angulo) {
    const valorAngulo = angulo.hasOwnProperty('valor') ? angulo.valor : angulo;
    if (!Number.isInteger(valorAngulo))
        throw new ErroEmTempoDeExecucao(
            this.token,
            'Você deve prover um número inteiro para o parâmetro `angulo`, em radiano(angulo).'
        );

    return valorAngulo * (Math.PI / 180);
};

//FUNÇÃO AFIM E QUADRÁTICA
/**
 * Gera valores para abscissa.
 * @param {inteiro} distancia A distância entra dois pontos.
 * @param {inteiro} valorPontoCentral O ponto central na abscissa.
 * @param {inteiro} numeroPontos Número de pontos a serem gerados (padrão: 7).
 * @returns Um vetor, contendo o número de pontos informado ou definido por padrão em uma abscissa.
 *          Se o número informado é par, um ponto negativo a mais é gerado.
 */
module.exports.gerarPontosAbscissa = function (distancia, valorPontoCentral, numeroPontos) {
    const distanciaResolvido = distancia.hasOwnProperty('valor') ? distancia.valor : distancia;
    const valorPontoCentralResolvido = valorPontoCentral.hasOwnProperty('valor') ? valorPontoCentral.valor : valorPontoCentral;
    let numeroPontosResolvido = numeroPontos.hasOwnProperty('valor') ? numeroPontos.valor : numeroPontos;
    if (!Number.isInteger(distanciaResolvido))
        throw new ErroEmTempoDeExecucao(
            this.token,
            'Você deve prover um valor inteiro para o parâmetro `distancia`, em gerarPontosAbscissa(distancia, valorInicial).'
        );

    if (!Number.isInteger(valorPontoCentralResolvido))
        throw new ErroEmTempoDeExecucao(
            this.token,
            'Você deve prover um valor inteiro para o parâmetro `valorInicial`, em gerarPontosAbscissa(distancia, valorInicial).'
        );

    if (!numeroPontosResolvido) {
        numeroPontosResolvido = 7;
    }

    const elementoInicial = valorPontoCentralResolvido - ((numeroPontosResolvido / 2) >> 0) * distanciaResolvido;
    const x = [];
    for (let i = 0; i < numeroPontosResolvido; i++) {
        x.push(elementoInicial + i * distanciaResolvido);
    }

    return x;
};

//Raíz da Função Afim
module.exports.fun1R = function (a, b) {
    const valorAResolvido = a.hasOwnProperty('valor') ? a.valor : a;
    const valorBResolvido = b.hasOwnProperty('valor') ? b.valor : b;
    if (isNaN(valorAResolvido) || valorAResolvido === null || isNaN(valorBResolvido) || valorBResolvido === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para fun1R(valor1,valor2).');
    return (-1 * valorBResolvido) / valorAResolvido;
};

//Intervalo Preenchido
module.exports.linspace = function (startValue, stopValue, cardinality) {
    const startValueResolvido = startValue.hasOwnProperty('valor') ? startValue.valor : startValue;
    const stopValueResolvido = stopValue.hasOwnProperty('valor') ? stopValue.valor : stopValue;
    const cardinalityResolvido = cardinality.hasOwnProperty('valor') ? cardinality.valor : cardinality;
    if (
        isNaN(startValueResolvido) ||
        startValueResolvido === null ||
        isNaN(stopValueResolvido) ||
        stopValueResolvido === null ||
        isNaN(cardinalityResolvido) ||
        cardinalityResolvido === null
    )
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para linspace(valor1,valor2,valor3).');
    const lista = [];
    const step = (stopValueResolvido - startValueResolvido) / (cardinalityResolvido - 1);
    for (let i = 0; i < cardinalityResolvido; i++) {
        lista.push(startValueResolvido + step * i);
    }
    return lista;
};

//Raízes da Função Quadrática
module.exports.fun2R = function (a, b, c) {
    const valueA = a.hasOwnProperty('valor') ? a.valor : a;
    const valueB = b.hasOwnProperty('valor') ? b.valor : b;
    const valueC = c.hasOwnProperty('valor') ? c.valor : c;
    if (isNaN(valueA) || valueA === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para fun2R(a,b,c).');

    const r1 = (-1 * valueB + Math.sqrt(Math.pow(valueB, 2) - 4 * valueA * valueC)) / (2 * valueA);
    const r2 = (-1 * valueB - Math.sqrt(Math.pow(valueB, 2) - 4 * valueA * valueC)) / (2 * valueA);

    const xv = (-1 * valueB) / (2 * valueA);
    const yv = ((-1 * (Math.pow(valueB, 2) - 4 * valueA * valueC)) / 4) * valueA;

    return [xv, yv];
};

//Aproximação de valores
const aprox = function (x, z) {
    let valueX = x.hasOwnProperty('valor') ? x.valor : x;
    let valueZ = z.hasOwnProperty('valor') ? z.valor : z;
    if (isNaN(valueX) || valueX === null || isNaN(valueZ) || valueZ === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para aprox(x,z).');
    if (valueZ == undefined) {
        valueZ = 2;
    }
    if (typeof valueX == 'number') {
        valueX = valueX.toFixed(valueZ);
    } else if (valueX[0].length == undefined) {
        // 1D array
        for (let i = 0; i < valueX.length; i++) {
            valueX[i] = parseFloat(valueX[i].toFixed(valueZ));
        }
    } else
        for (let i = 0; i < valueX.length; i++) {
            // 2D array
            for (let j = 0; j < valueX[0].length; j++) {
                valueX[i][j] = parseFloat(valueX[i][j].toFixed(valueZ));
            }
        }
    return valueX;
};

module.exports.aprox = aprox;

//Parâmetros da Função
const matrizn = function (z) {
    const valueZ = z.hasOwnProperty('valor') ? z.valor : z;
    if (isNaN(valueZ) || valueZ === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para matrizn(z).');
    const n = arguments.length;
    const data = Array.from(Array(1), () => new Array(n));
    for (let i = 0; i < n; i++) {
        data[0][i] = arguments[i];
    }
    return data;
};

module.exports.matrizn = matrizn;

//Vetor de pontos aleatórios
module.exports.pontosAleatorios = function (n) {
    const valueN = n.hasOwnProperty('valor') ? n.valor : n;
    if (isNaN(valueN) || valueN === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para pale(n).');
    let ex;
    if (ex == undefined) {
        ex = 0;
    }
    const x = [];
    x[0] = 100;
    for (let i = 1; i < valueN; i++) {
        x[i] = ex + x[i - 1] + Math.random() * 2 - 1;
    }
    const xx = aprox(x, 2);
    return xx;
};

//Intervalo A-B
module.exports.vet = function (a, b) {
    const valueA = a.hasOwnProperty('valor') ? a.valor : a;
    const valueB = b.hasOwnProperty('valor') ? b.valor : b;
    if (isNaN(valueA) || valueA === null || isNaN(valueB) || valueB === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para vet(a,b).');
    const data = Array.from(Array(1), () => new Array(valueB - valueA + 1));

    for (let i = 0; i < data[0].length; i++) {
        data[0][i] = valueA + i;
    }
    return matrizn(data);
};

/**
 * Conta quantas vezes um determinado valor aparece em um vetor.
 * @param {qualquer[]} vetor Vetor de elementos
 * @param {qualquer} valor Valor a ser encontrado no vetor
 * @returns Valor inteiro, com o número de vezes que `valor` foi encontrado em `vetor`.
 */
module.exports.numeroOcorrencias = function (vetor, valor) {
    if (!Array.isArray(vetor))
        throw new ErroEmTempoDeExecucao(
            this.token,
            'Parâmetro `vetor` deve ser um vetor, em numeroOcorrencias(vetor, valor).'
        );

    return vetor.filter((v) => v === valor).length;
};

/* ESTATÍSTICA */

/**
 * Encontra o elemento máximo em um vetor.
 * @param {inteiro[]} vetor Um vetor de números inteiros.
 * @returns O maior número encontrado em um vetor.
 */
module.exports.max = function (vetor) {
    if (!Array.isArray(vetor))
        throw new ErroEmTempoDeExecucao(this.token, 'Parâmetro `vetor` deve ser um vetor, em max(vetor).');

    if (vetor.some(isNaN))
        throw new ErroEmTempoDeExecucao(this.token, 'Todos os elementos de `vetor` deve ser numéricos, em max(vetor).');

    return Math.max.apply(null, vetor);
};

/**
 * Encontra o elemento mínimo em um vetor.
 * @param {inteiro[]} vetor Um vetor de números inteiros.
 * @returns O menor número encontrado em um vetor.
 */
module.exports.min = function (vetor) {
    if (!Array.isArray(vetor))
        throw new ErroEmTempoDeExecucao(this.token, 'Parâmetro `vetor` deve ser um vetor, em min(vetor).');

    if (vetor.some(isNaN))
        throw new ErroEmTempoDeExecucao(this.token, 'Todos os elementos de `vetor` deve ser numéricos, em min(vetor).');

    return Math.min.apply(null, vetor);
};

//Soma de determinada matriz
const smtr = function (a) {
    const valueA = a.hasOwnProperty('valor') ? a.valor : a;
    if (isNaN(valueA) || valueA === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para smtr(a).');

    let z = 0;
    if (valueA.length == 1) {
        // valueA is valueA 1D row array
        for (let j = 0; j < valueA[0].length; j++) {
            z = z + valueA[0][j];
        }
    } else if (valueA[0].length == 1) {
        // valueA is valueA 1D column array
        for (let i = 0; i < valueA.length; i++) {
            z = z + valueA[i][0];
        }
    } else {
        for (let j = 0; j < valueA.length; j++) {
            z = z + valueA[j];
        }
    }

    return aprox(z, 2);
};

module.exports.smtr = smtr;

// Retorna a média de um vetor de números
module.exports.media = function () {
    const argumentsLength = Object.keys(arguments).length;

    if (argumentsLength <= 0) {
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve fornecer um parâmetro para a função.');
    }

    if (argumentsLength > 1) {
        throw new ErroEmTempoDeExecucao(this.token, 'A função recebe apenas um parâmetro.');
    }

    // Pega o primeiro argumento do objeto de argumentos
    const args = arguments['0'];

    if (!Array.isArray(args)) {
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve fornecer um parâmetro do tipo vetor.');
    }

    // Valida se o array está vazio.
    if (!args.length) {
        throw new ErroEmTempoDeExecucao(this.token, 'Vetor vazio. Você deve fornecer ao menos um valor ao vetor.');
    }

    // Valida se o array contém apenas valores do tipo número.
    args.forEach((item) => {
        if (typeof item !== 'number') {
            throw new ErroEmTempoDeExecucao(
                this.token,
                'Você deve fornecer um vetor contendo apenas valores do tipo número.'
            );
        }
    });

    // Soma todos os itens.
    const valoresSomados = args.reduce((acumulador, itemAtual) => acumulador + itemAtual, 0);

    // Faz o cáculo da média em si e retorna.
    return valoresSomados / args.length;
};

//Média aritmética de uma matriz
const ve = function (a) {
    const valueA = a.hasOwnProperty('valor') ? a.valor : a;
    if (isNaN(valueA) || valueA === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para ve(a).');

    if (valueA.length == 1) {
        return aprox(smtr(valueA) / valueA[0].length, 4);
    } // a is a row array
    if (valueA[0].length == 1) {
        return aprox(smtr(valueA) / valueA.length, 4);
    } // a is a column array
    if (valueA[0].length == undefined) {
        return a(smtr(valueA) / valueA.length, 4);
    }
};
module.exports.ve = ve;

//Soma dos quadrados dos resíduos (sqr) de uma matriz
const sqr = function (a) {
    const valueA = a.hasOwnProperty('valor') ? a.valor : a;
    if (isNaN(valueA) || valueA === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para sqr(a).');

    const mean = ve(valueA);
    let sum = 0;
    let i = valueA.length;
    let tmp;
    while (--i >= 0) {
        tmp = valueA[i] - mean;
        sum += tmp * tmp;
    }
    return sum;
};
module.exports.sqr = sqr;

//Variação de uma matriz
module.exports.variancia = function (array, flag) {
    if (isNaN(array) || array === null || isNaN(flag) || flag === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para variancia(matriz, flag).');

    if (flag == undefined) {
        flag = 1;
    }
    return sqr(array) / (array.length - (flag ? 1 : 0));
};

//Covariância de duas matrizes
module.exports.colet = function (array1, array2) {
    if (isNaN(array1) || array1 === null || isNaN(array1) || array2 === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para covar(matriz1, matriz2).');

    let u = ve(array1);
    let v = ve(array2);
    let arr1Len = array1.length;
    let sq_dev = new Array(arr1Len);
    for (let i = 0; i < arr1Len; i++) sq_dev[i] = (array1[i] - u) * (array2[i] - v);
    return smtr(sq_dev) / (arr1Len - 1);
};

/*TRIGONOMETRIA*/
//Seno de um número
module.exports.sen = function (x) {
    const valorX = x.hasOwnProperty('valor') ? x.valor : x;
    if (isNaN(valorX) || valorX === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para sen(x).');

    return Math.sin(valorX);
};

//Cosseno de um número
module.exports.cos = function (x) {
    const valorX = x.hasOwnProperty('valor') ? x.valor : x;
    if (isNaN(valorX) || valorX === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para cos(x).');

    return Math.cos(valorX);
};

//Tangente de um número
module.exports.tan = function (x) {
    const valorX = x.hasOwnProperty('valor') ? x.valor : x;
    if (isNaN(valorX) || valorX === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para tan(x).');

    return Math.tan(valorX);
};

//Arco cosseno de um número
module.exports.arcos = function (x) {
    const valorX = x.hasOwnProperty('valor') ? x.valor : x;
    if (isNaN(valorX) || valorX === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para arcos(x).');

    return Math.acos(valorX);
};

//Arco seno de um número
module.exports.arsen = function (x) {
    const valorX = x.hasOwnProperty('valor') ? x.valor : x;
    if (isNaN(valorX) || valorX === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para arsen(x).');

    return Math.asin(valorX);
};

//Arco tangente de um número
module.exports.artan = function (x) {
    const valorX = x.hasOwnProperty('valor') ? x.valor : x;
    if (isNaN(valorX) || valorX === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para artan(x).');

    return Math.atan(valorX);
};

//Exponencial
module.exports.exp = function (x) {
    const valorX = x.hasOwnProperty('valor') ? x.valor : x;
    if (isNaN(valorX) || valorX === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para exp(x).');

    return Math.exp(valorX);
};

//Logaritmo natural
module.exports.log = function (x) {
    const valorX = x.hasOwnProperty('valor') ? x.valor : x;
    if (isNaN(valorX) || valorX === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para log(x).');

    return Math.log(valorX);
};

// Retorna a base elevada ao expoente
const pot = function (base, expoente) {
    const valorBaseResolvido = base.hasOwnProperty('valor') ? base.valor : base;
    const valorExpoenteResolvido = expoente.hasOwnProperty('valor') ? expoente.valor : expoente;
    if (typeof valorBaseResolvido !== 'number' || typeof valorExpoenteResolvido !== 'number') {
        throw new ErroEmTempoDeExecucao(this.token, 'Os parâmetros devem ser do tipo número.');
    }

    return Math.pow(valorBaseResolvido, valorExpoenteResolvido);
};

module.exports.potencia = pot;

//Raíz quadrada
module.exports.raizq = function (x) {
    const valorX = x.hasOwnProperty('valor') ? x.valor : x;
    if (isNaN(valorX) || valorX === null) throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para raizq(x).');

    return Math.sqrt(valorX);
};

/*CINEMÁTICA*/

//Velocidade média
module.exports.velocidadeMedia = function (s, t) {
    const valorS = s.hasOwnProperty('valor') ? s.valor : s;
    const valorT = t.hasOwnProperty('valor') ? t.valor : t;
    if (isNaN(valorS) || valorS === null || isNaN(valorT) || valorT === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para velocidadeMedia(d,t).');

    return valorS / valorT;
};

//Espaço percorrido
module.exports.deltaS = function (s0, s) {
    const valorS0 = s0.hasOwnProperty('valor') ? s0.valor : s0;
    const valorS = s.hasOwnProperty('valor') ? s.valor : s;
    if (isNaN(valorS0) || valorS0 === null || isNaN(valorS) || valorS === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para deltas(e0,e1).');
    let ds = valorS - valorS0;
    return ds;
};

//Tempo Percorrido
module.exports.deltaT = function (t0, t) {
    const valorT0 = t0.hasOwnProperty('valor') ? t0.valor : t0;
    const valorT = t.hasOwnProperty('valor') ? t.valor : t;
    if (isNaN(valorT0) || valorT0 === null || isNaN(valorT) || valorT === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para deltat(t,t1).');
    let dt = valorT - valorT0;
    return dt;
};

// Cálculo de aceleração
module.exports.aceleracao = function (velocidadeFinal, velocidadeInicial, tempoFinal, tempoInicial) {
    const velocidadeFinalResolvido = velocidadeFinal.hasOwnProperty('valor') ? velocidadeFinal.valor : velocidadeFinal;
    const velocidadeInicialResolvido = velocidadeInicial.hasOwnProperty('valor') ? velocidadeInicial.valor : velocidadeInicial;
    const tempoFinalResolvido = tempoFinal.hasOwnProperty('valor') ? tempoFinal.valor : tempoFinal;
    const tempoInicialResolvido = tempoInicial.hasOwnProperty('valor') ? tempoInicial.valor : tempoInicial;
    if (velocidadeFinalResolvido === null || velocidadeInicialResolvido === null || tempoFinalResolvido === null || tempoInicialResolvido === null) {
        throw new ErroEmTempoDeExecucao(this.token, 'Devem ser fornecidos quatro parâmetros obrigatórios.');
    }

    if (
        typeof velocidadeFinalResolvido !== 'number' ||
        typeof velocidadeInicialResolvido !== 'number' ||
        typeof tempoFinalResolvido !== 'number' ||
        typeof tempoInicialResolvido !== 'number'
    ) {
        throw new ErroEmTempoDeExecucao(this.token, 'Todos os parâmetros devem ser do tipo número.');
    }

    return (velocidadeFinalResolvido - velocidadeInicialResolvido) / (tempoFinalResolvido - tempoInicialResolvido);
};

//Função Horária da Posição (M.R.U)
module.exports.mrufh = function (s0, v, t) {
    const valorS0 = s0.hasOwnProperty('valor') ? s0.valor : s0;
    const valorV = v.hasOwnProperty('valor') ? v.valor : v;
    let valorT = t.hasOwnProperty('valor') ? t.valor : t;
    if (isNaN(valorS0) || valorS0 === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para mrufh(s0,v,t).');
    valorT = valorT + 1;
    const s = [];
    let index = 0;
    for (let i = 0; i < valorT; i++) {
        s[index] = valorS0 + valorV * i;
        index++;
    }

    return ['Função: ' + valorS0 + '+(' + valorV + ')*t' + '<br>' + 'Posições: ' + s];
};

//Gráfico da velocidade (M.R.U.V)
module.exports.mruv = function (s0, s, a) {
    const valorS0 = s0.hasOwnProperty('valor') ? s0.valor : s0;
    const valorS = s.hasOwnProperty('valor') ? s.valor : s;
    const valorA = a.hasOwnProperty('valor') ? a.valor : a;
    if (isNaN(valorS0) || valorS0 === null || isNaN(valorS) || valorS === null || isNaN(valorA) || valorA === null)
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para mruv(Pi, Vf, A).');
    const vf = [];
    const x = [];
    let v: any = [];
    let index = 0;
    for (let i = 0; i < valorS; i++) {
        v = index;
        vf[index] = Math.sqrt(2 * valorA * (index - valorS0));
        x[index] = i;
        index++;
    }

    return vf;
};

/*Controle e Servomecanismos*/
module.exports.pid = function (Mo, t, K, T1, T2) {
    const valorMo = Mo.hasOwnProperty('valor') ? Mo.valor : Mo;
    const valorT = t.hasOwnProperty('valor') ? t.valor : t;
    const valorK = K.hasOwnProperty('valor') ? K.valor : K;
    const valorT1 = T1.hasOwnProperty('valor') ? T1.valor : T1;
    const valorT2 = T2.hasOwnProperty('valor') ? T2.valor : T2;
    if (
        isNaN(valorMo) ||
        valorMo === null ||
        isNaN(valorT) ||
        valorT === null ||
        isNaN(valorK) ||
        valorK === null ||
        isNaN(valorT1) ||
        valorT1 === null ||
        isNaN(valorT2) ||
        valorT2 === null
    ) {
        throw new ErroEmTempoDeExecucao(this.token, 'Você deve prover valores para pid(Ov, Ts, K, T1, T2).');
    }
    let pi = Math.PI; //Pi da bilbioteca Math.js

    //AvalorMortecimento Relativo
    let csi = (-1 * Math.log(valorMo / 100)) / Math.sqrt(Math.pow(pi, 2) + pot(Math.log(valorMo / 100), 2));

    //Frequência Natural
    let Wn = 4 / (t * csi);

    //Controlador Proporcional (P)
    let Kp = 20 * (Math.pow(csi, 2) * Math.pow(Wn, 2) * valorT1 * valorT2) + (Math.pow(Wn, 2) * valorT1 * valorT2 - 1) / valorK;

    //Controlador Integral (I)
    let Ki = (10 * csi * Math.pow(Wn, 3) * valorT1 * valorT2) / valorK;

    //Controlador Derivativo (D)
    let Kd = (12 * csi * Wn * valorT1 * valorT2 - valorT1 - valorT2) / valorK;

    return [csi, Wn, Kp, Ki, Kd];
};

// Retorna o comprimento de um vetor
module.exports.comp = function (array) {
    if (!Array.isArray(array)) {
        throw new ErroEmTempoDeExecucao(this.token, 'O valor passado pra função deve ser um vetor.');
    }

    return array.length;
};

// Retorna o menor número inteiro dentre o valor de "value"
module.exports.minaprox = function (value) {
    const valueResolvido = value.hasOwnProperty('valor') ? value.valor : value;
    if (typeof valueResolvido !== 'number') {
        throw new ErroEmTempoDeExecucao(this.token, 'O valor passado pra função deve ser um número.');
    }

    return Math.floor(valueResolvido);
};
