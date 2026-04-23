import { FuncaoPadrao } from '../../../interpretador/estruturas';
import { PilhaEscoposExecucaoInterface } from '../../../interfaces/pilha-escopos-execucao-interface';

export default function carregarBibliotecaGlobalTenda(
    interpretador: any,
    globals: PilhaEscoposExecucaoInterface
): void {
    // -------------------------------------------------------------------------
    // Saída
    // -------------------------------------------------------------------------
    globals.definirVariavel('Saída', {
        exiba: new FuncaoPadrao(1, function (_: any, texto: any) {
            const valor =
                texto !== null && texto !== undefined && texto.hasOwnProperty('valor')
                    ? texto.valor
                    : texto;
            interpretador.funcaoDeRetorno(
                valor !== null && valor !== undefined ? String(valor) : 'nulo'
            );
        }),
        escreva: new FuncaoPadrao(1, function (_: any, texto: any) {
            const valor =
                texto !== null && texto !== undefined && texto.hasOwnProperty('valor')
                    ? texto.valor
                    : texto;
            interpretador.funcaoDeRetorno(
                valor !== null && valor !== undefined ? String(valor) : 'nulo'
            );
        }),
        leia: new FuncaoPadrao(1, function (_: any, mensagem: any) {
            const msg =
                mensagem !== null && mensagem !== undefined && mensagem.hasOwnProperty('valor')
                    ? mensagem.valor
                    : mensagem;
            return new Promise((resolve) => {
                interpretador.interfaceEntradaSaida.question(msg ?? '', (resposta: string) => {
                    resolve(resposta);
                });
            });
        }),
        entrada: new FuncaoPadrao(0, function () {
            return new Promise((resolve) => {
                interpretador.interfaceEntradaSaida.question('', (resposta: string) => {
                    resolve(resposta);
                });
            });
        }),
    });

    // -------------------------------------------------------------------------
    // Lista
    // -------------------------------------------------------------------------
    globals.definirVariavel('Lista', {
        tamanho: new FuncaoPadrao(1, function (_: any, lista: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            return v.length;
        }),
        insira: new FuncaoPadrao(2, function (_: any, lista: any, item: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            const i =
                item !== null && item !== undefined && item.hasOwnProperty('valor')
                    ? item.valor
                    : item;
            v.push(i);
        }),
        remova: new FuncaoPadrao(2, function (_: any, lista: any, item: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            const i =
                item !== null && item !== undefined && item.hasOwnProperty('valor')
                    ? item.valor
                    : item;
            const idx = v.indexOf(i);
            if (idx !== -1) v.splice(idx, 1);
        }),
        remova_todos: new FuncaoPadrao(2, function (_: any, lista: any, item: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            const i =
                item !== null && item !== undefined && item.hasOwnProperty('valor')
                    ? item.valor
                    : item;
            let idx = v.indexOf(i);
            while (idx !== -1) {
                v.splice(idx, 1);
                idx = v.indexOf(i);
            }
        }),
        remova_por_índice: new FuncaoPadrao(2, function (_: any, lista: any, índice: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            const i =
                índice !== null && índice !== undefined && índice.hasOwnProperty('valor')
                    ? índice.valor
                    : índice;
            v.splice(i, 1);
        }),
        obtenha: new FuncaoPadrao(2, function (_: any, lista: any, índice: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            const i =
                índice !== null && índice !== undefined && índice.hasOwnProperty('valor')
                    ? índice.valor
                    : índice;
            return v[i];
        }),
        índice_de: new FuncaoPadrao(2, function (_: any, lista: any, item: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            const i =
                item !== null && item !== undefined && item.hasOwnProperty('valor')
                    ? item.valor
                    : item;
            return v.indexOf(i);
        }),
        contém: new FuncaoPadrao(2, function (_: any, lista: any, item: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            const i =
                item !== null && item !== undefined && item.hasOwnProperty('valor')
                    ? item.valor
                    : item;
            return v.includes(i);
        }),
        vazio: new FuncaoPadrao(1, function (_: any, lista: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            return v.length === 0;
        }),
        limpa: new FuncaoPadrao(1, function (_: any, lista: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            v.splice(0);
        }),
        fatia: new FuncaoPadrao(3, function (_: any, lista: any, início: any, fim: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            const ini =
                início !== null && início !== undefined && início.hasOwnProperty('valor')
                    ? início.valor
                    : início;
            const f =
                fim !== null && fim !== undefined && fim.hasOwnProperty('valor') ? fim.valor : fim;
            return v.slice(ini, f);
        }),
        para_cada: new FuncaoPadrao(2, async function (_visitante: any, lista: any, fn: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            const f = fn !== null && fn !== undefined && fn.hasOwnProperty('valor') ? fn.valor : fn;
            for (let i = 0; i < v.length; i++) {
                await f.chamar(interpretador, [v[i]]);
            }
        }),
        de_intervalo: new FuncaoPadrao(2, function (_: any, início: any, fim: any) {
            const ini =
                início !== null && início !== undefined && início.hasOwnProperty('valor')
                    ? início.valor
                    : início;
            const f =
                fim !== null && fim !== undefined && fim.hasOwnProperty('valor') ? fim.valor : fim;
            const resultado = [];
            for (let i = ini; i <= f; i++) resultado.push(i);
            return resultado;
        }),
        de_texto: new FuncaoPadrao(1, function (_: any, texto: any) {
            const t =
                texto !== null && texto !== undefined && texto.hasOwnProperty('valor')
                    ? texto.valor
                    : texto;
            return t.split('');
        }),
        transforma: new FuncaoPadrao(2, async function (_visitante: any, lista: any, fn: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            const f = fn !== null && fn !== undefined && fn.hasOwnProperty('valor') ? fn.valor : fn;
            const resultado = [];
            for (let i = 0; i < v.length; i++) {
                resultado.push(await f.chamar(interpretador, [v[i]]));
            }
            return resultado;
        }),
    });

    // -------------------------------------------------------------------------
    // Matemática
    // -------------------------------------------------------------------------
    globals.definirVariavel('Matemática', {
        maior_número: Number.MAX_VALUE,
        menor_número: Number.MIN_VALUE,
        pi: Math.PI,
        e: Math.E,

        absoluto: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.abs(v);
        }),
        arredonda: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.round(v);
        }),
        teto: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.ceil(v);
        }),
        piso: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.floor(v);
        }),
        raiz_quadrada: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.sqrt(v);
        }),
        seno: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.sin(v);
        }),
        cosseno: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.cos(v);
        }),
        tangente: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.tan(v);
        }),
        arco_seno: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.asin(v);
        }),
        arco_cosseno: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.acos(v);
        }),
        arco_tangente: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.atan(v);
        }),
        logaritmo_natural: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.log(v);
        }),
        logaritmo_10: new FuncaoPadrao(1, function (_: any, n: any) {
            const v = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return Math.log10(v);
        }),
        potência: new FuncaoPadrao(2, function (_: any, base: any, expoente: any) {
            const b =
                base !== null && base !== undefined && base.hasOwnProperty('valor')
                    ? base.valor
                    : base;
            const e =
                expoente !== null && expoente !== undefined && expoente.hasOwnProperty('valor')
                    ? expoente.valor
                    : expoente;
            return Math.pow(b, e);
        }),
        máximo: new FuncaoPadrao(2, function (_: any, a: any, b: any) {
            const va = a !== null && a !== undefined && a.hasOwnProperty('valor') ? a.valor : a;
            const vb = b !== null && b !== undefined && b.hasOwnProperty('valor') ? b.valor : b;
            return Math.max(va, vb);
        }),
        mínimo: new FuncaoPadrao(2, function (_: any, a: any, b: any) {
            const va = a !== null && a !== undefined && a.hasOwnProperty('valor') ? a.valor : a;
            const vb = b !== null && b !== undefined && b.hasOwnProperty('valor') ? b.valor : b;
            return Math.min(va, vb);
        }),
        aleatório: new FuncaoPadrao(0, function (_: any, min: any, max: any) {
            if (min === undefined) {
                return Math.random();
            }
            const vMin = min !== null && min.hasOwnProperty('valor') ? min.valor : min;
            if (max === undefined) {
                return Math.floor(Math.random() * vMin);
            }
            const vMax = max !== null && max.hasOwnProperty('valor') ? max.valor : max;
            return Math.floor(Math.random() * (vMax - vMin)) + vMin;
        }),
    });

    // -------------------------------------------------------------------------
    // Texto
    // -------------------------------------------------------------------------
    globals.definirVariavel('Texto', {
        erros: {
            CONVERSÃO_INVÁLIDA: 'CONVERSÃO_INVÁLIDA',
        },

        tamanho: new FuncaoPadrao(1, function (_: any, t: any) {
            const v = t !== null && t !== undefined && t.hasOwnProperty('valor') ? t.valor : t;
            return v.length;
        }),
        vazio: new FuncaoPadrao(1, function (_: any, t: any) {
            const v = t !== null && t !== undefined && t.hasOwnProperty('valor') ? t.valor : t;
            return v.length === 0;
        }),
        subtexto: new FuncaoPadrao(3, function (_: any, t: any, início: any, fim: any) {
            const v = t !== null && t !== undefined && t.hasOwnProperty('valor') ? t.valor : t;
            const ini =
                início !== null && início !== undefined && início.hasOwnProperty('valor')
                    ? início.valor
                    : início;
            const f =
                fim !== null && fim !== undefined && fim.hasOwnProperty('valor') ? fim.valor : fim;
            return v.slice(ini, f);
        }),
        para_lista: new FuncaoPadrao(2, function (_: any, t: any, sep: any) {
            const v = t !== null && t !== undefined && t.hasOwnProperty('valor') ? t.valor : t;
            const s =
                sep !== null && sep !== undefined && sep.hasOwnProperty('valor') ? sep.valor : sep;
            return v.split(s ?? '');
        }),
        de_lista: new FuncaoPadrao(2, function (_: any, lista: any, sep: any) {
            const v =
                lista !== null && lista !== undefined && lista.hasOwnProperty('valor')
                    ? lista.valor
                    : lista;
            const s =
                sep !== null && sep !== undefined && sep.hasOwnProperty('valor') ? sep.valor : sep;
            return v.join(s ?? '');
        }),
        para_maiúsculas: new FuncaoPadrao(1, function (_: any, t: any) {
            const v = t !== null && t !== undefined && t.hasOwnProperty('valor') ? t.valor : t;
            return v.toUpperCase();
        }),
        para_minúsculas: new FuncaoPadrao(1, function (_: any, t: any) {
            const v = t !== null && t !== undefined && t.hasOwnProperty('valor') ? t.valor : t;
            return v.toLowerCase();
        }),
        contém: new FuncaoPadrao(2, function (_: any, t: any, sub: any) {
            const v = t !== null && t !== undefined && t.hasOwnProperty('valor') ? t.valor : t;
            const s =
                sub !== null && sub !== undefined && sub.hasOwnProperty('valor') ? sub.valor : sub;
            return v.includes(s);
        }),
        começa_com: new FuncaoPadrao(2, function (_: any, t: any, prefixo: any) {
            const v = t !== null && t !== undefined && t.hasOwnProperty('valor') ? t.valor : t;
            const p =
                prefixo !== null && prefixo !== undefined && prefixo.hasOwnProperty('valor')
                    ? prefixo.valor
                    : prefixo;
            return v.startsWith(p);
        }),
        termina_com: new FuncaoPadrao(2, function (_: any, t: any, sufixo: any) {
            const v = t !== null && t !== undefined && t.hasOwnProperty('valor') ? t.valor : t;
            const s =
                sufixo !== null && sufixo !== undefined && sufixo.hasOwnProperty('valor')
                    ? sufixo.valor
                    : sufixo;
            return v.endsWith(s);
        }),
        índice_de: new FuncaoPadrao(2, function (_: any, t: any, sub: any) {
            const v = t !== null && t !== undefined && t.hasOwnProperty('valor') ? t.valor : t;
            const s =
                sub !== null && sub !== undefined && sub.hasOwnProperty('valor') ? sub.valor : sub;
            return v.indexOf(s);
        }),
        repita: new FuncaoPadrao(2, function (_: any, t: any, n: any) {
            const v = t !== null && t !== undefined && t.hasOwnProperty('valor') ? t.valor : t;
            const vezes = n !== null && n !== undefined && n.hasOwnProperty('valor') ? n.valor : n;
            return v.repeat(vezes);
        }),
        substitua: new FuncaoPadrao(3, function (_: any, t: any, busca: any, rep: any) {
            const v = t !== null && t !== undefined && t.hasOwnProperty('valor') ? t.valor : t;
            const b =
                busca !== null && busca !== undefined && busca.hasOwnProperty('valor')
                    ? busca.valor
                    : busca;
            const r =
                rep !== null && rep !== undefined && rep.hasOwnProperty('valor') ? rep.valor : rep;
            return v.replaceAll(b, r);
        }),
    });

    // -------------------------------------------------------------------------
    // Data
    // -------------------------------------------------------------------------
    globals.definirVariavel('Data', {
        erros: {
            ISO_INVÁLIDA: 'ISO_INVÁLIDA',
            TIMESTAMP_INVÁLIDO: 'TIMESTAMP_INVÁLIDO',
            FUSO_HORÁRIO_INVÁLIDO: 'FUSO_HORÁRIO_INVÁLIDO',
        },

        agora: new FuncaoPadrao(0, function () {
            return Date.now();
        }),
        para_iso: new FuncaoPadrao(1, function (_: any, data: any) {
            const v =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            return new Date(v).toISOString();
        }),
        para_timestamp: new FuncaoPadrao(1, function (_: any, data: any) {
            const v =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            return new Date(v).getTime();
        }),
        de_iso: new FuncaoPadrao(1, function (_: any, iso: any) {
            const v =
                iso !== null && iso !== undefined && iso.hasOwnProperty('valor') ? iso.valor : iso;
            return new Date(v).getTime();
        }),
        de_timestamp: new FuncaoPadrao(1, function (_: any, ts: any) {
            const v = ts !== null && ts !== undefined && ts.hasOwnProperty('valor') ? ts.valor : ts;
            return new Date(v).getTime();
        }),
        com_região: new FuncaoPadrao(2, function (_: any, data: any, região: any) {
            const d =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            const r =
                região !== null && região !== undefined && região.hasOwnProperty('valor')
                    ? região.valor
                    : região;
            return new Date(d).toLocaleString(r);
        }),
        desvio_fuso_horário: new FuncaoPadrao(1, function (_: any, data: any) {
            const v =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            return new Date(v).getTimezoneOffset();
        }),
        ano: new FuncaoPadrao(1, function (_: any, data: any) {
            const v =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            return new Date(v).getFullYear();
        }),
        mês: new FuncaoPadrao(1, function (_: any, data: any) {
            const v =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            return new Date(v).getMonth() + 1;
        }),
        dia: new FuncaoPadrao(1, function (_: any, data: any) {
            const v =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            return new Date(v).getDate();
        }),
        hora: new FuncaoPadrao(1, function (_: any, data: any) {
            const v =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            return new Date(v).getHours();
        }),
        minuto: new FuncaoPadrao(1, function (_: any, data: any) {
            const v =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            return new Date(v).getMinutes();
        }),
        segundo: new FuncaoPadrao(1, function (_: any, data: any) {
            const v =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            return new Date(v).getSeconds();
        }),
        dia_da_semana: new FuncaoPadrao(1, function (_: any, data: any) {
            const v =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            return new Date(v).getDay();
        }),
        dia_do_ano: new FuncaoPadrao(1, function (_: any, data: any) {
            const v =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            const d = new Date(v);
            const início = new Date(d.getFullYear(), 0, 0);
            const diff = d.getTime() - início.getTime();
            return Math.floor(diff / (1000 * 60 * 60 * 24));
        }),
        semana_do_ano: new FuncaoPadrao(1, function (_: any, data: any) {
            const v =
                data !== null && data !== undefined && data.hasOwnProperty('valor')
                    ? data.valor
                    : data;
            const d = new Date(v);
            const início = new Date(Date.UTC(d.getFullYear(), 0, 1));
            const diff = d.getTime() - início.getTime();
            return Math.ceil((Math.floor(diff / (1000 * 60 * 60 * 24)) + início.getDay() + 1) / 7);
        }),
    });
}
