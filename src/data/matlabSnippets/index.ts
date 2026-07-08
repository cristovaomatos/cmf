import type { MatlabSnippet } from './types'
import { bsCnSnippets } from './bsCn'
import { bsMolRk4Snippets } from './bsMolRk4'
import { bsAmericanPutPsorSnippets } from './bsAmericanPutPsor'
import { eulerMaruyamaSnippets } from './eulerMaruyama'
import { haltonNodesSnippets } from './haltonNodes'
import { milsteinSnippets } from './milstein'
import { q1Snippets } from './q1'
import { q2Snippets } from './q2'
import { lcgSnippets, randnArSnippets, randu01Snippets } from './randomGenerators'

export type { MatlabSnippet }
export {
  bsCnSnippets,
  bsMolRk4Snippets,
  bsAmericanPutPsorSnippets,
  eulerMaruyamaSnippets,
  haltonNodesSnippets,
  lcgSnippets,
  milsteinSnippets,
  randnArSnippets,
  randu01Snippets,
  q1Snippets,
  q2Snippets,
}

export const snippetsByPage: Record<string, MatlabSnippet[]> = {
  'crank-nicolson': bsCnSnippets,
  'method-of-lines-rk4': bsMolRk4Snippets,
  'american-psor-method': bsAmericanPutPsorSnippets,
  'euler-maruyama-method': eulerMaruyamaSnippets,
  'halton-nodes': haltonNodesSnippets,
  'linear-congruential-generator': [...lcgSnippets, ...randu01Snippets],
  'milstein-method': milsteinSnippets,
  'acceptance-rejection-method': randnArSnippets,
  'european-put-results': q1Snippets,
  'american-put-results': q2Snippets,
}

export const sourceFileByPage: Record<string, string> = {
  'crank-nicolson': 'bs_cn.m',
  'method-of-lines-rk4': 'bs_mol_rk4.m',
  'american-psor-method': 'bs_american_put_psor.m',
  'euler-maruyama-method': 'euler_maruyama.m',
  'halton-nodes': 'halton_nodes.m',
  'linear-congruential-generator': 'lcg.m, randu01.m',
  'milstein-method': 'milstein.m',
  'acceptance-rejection-method': 'randn_ar.m',
  'european-put-results': 'q1.m',
  'american-put-results': 'q2.m',
}
