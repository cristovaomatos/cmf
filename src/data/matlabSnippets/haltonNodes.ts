import type { MatlabSnippet } from './types'

export const haltonNodesSnippets: MatlabSnippet[] = [
  {
    id: 'halton-nodes',
    label: 'Halton nodes in two dimensions',
    code: `function H = halton_nodes(N)
    % Generate N Halton nodes in [0,1] x [0,1].
    % Method: Halton sequence from the lecture notes,
    % using radical inverse functions with bases 2 and 3.

    H = [radinv(N, 2), radinv(N, 3)];

end`,
  },
  {
    id: 'radical-inverse',
    label: 'Radical inverse helper',
    code: `function x = radinv(N, base)
    % Generate the first N elements of the radical inverse sequence.
    % Method: radical inverse construction from the lecture notes.

    kmax = floor(log(N) / log(base)) + 1;

    n = (1:N)';
    x = zeros(N,1);
    q = base;

    for k = 1:kmax
        d = mod(n, base);
        x = x + d / q;
        n = floor(n / base);
        q = q * base;
    end

end`,
  },
]
