import type { MatlabSnippet } from './types'

export const lcgSnippets: MatlabSnippet[] = [
  {
    id: 'lcg',
    label: 'Linear congruential generator',
    code: `function [x, seed_out] = lcg(N, seed, a, b)
    
    if nargin < 3
        a = 0;
        b = 1;
    end

    % Params
    M = 2^31 - 1;
    A = 16807;
    B = 0;

    m_i = seed;
    
    x = zeros(N,1);
    
    for i = 1:N
        m_i = mod(A*m_i + B, M);
        x(i) = m_i/M;
    end

    seed_out = m_i;

    % Scale U(0,1) to U(a,b)
    x = a + (b-a)*x;

end`,
  },
]

export const randu01Snippets: MatlabSnippet[] = [
  {
    id: 'randu01',
    label: 'Uniform U([0,1]) wrapper',
    code: `function [x, seed_out] = randu01(N, seed)
    % Generate N pseudo-random realizations of U([0,1])
    % using the linear congruential generator function lcg.
    [x, seed_out] = lcg(N, seed, 0, 1);

end`,
  },
]

export const randnArSnippets: MatlabSnippet[] = [
  {
    id: 'randn-ar',
    label: 'Acceptance-rejection normal generator',
    code: `% randn_ar.m
function x = randn_ar(N, seed)
    % Generate N pseudo-random realizations of N(0,1).
    % Method: acceptance-rejection algorithm from the lecture notes (page 94),
    % using a Cauchy proposal density g and target density f.

    f = @(z) exp(-z.^2/2) / sqrt(2*pi);      % target: N(0,1)
    g = @(z) 1 ./ (pi*(1 + z.^2));           % proposal: Cauchy(0,1)
    M = sqrt(2*pi/exp(1));                   % bound: f(x) <= M g(x)

    x = zeros(N,1);
    n = 0;
    k = 0;

    while n < N
        m = ceil(1.8*(N-n));                 % proposal batch size

        u0 = lcg(m, seed + 2*k);
        u1 = lcg(m, seed + 2*k + 1);

        y = tan(pi*u0 - pi/2);               % inverse Cauchy
        accept = u1 <= f(y) ./ (M*g(y));     % accept/reject test

        z = y(accept);
        q = min(length(z), N-n);

        x(n+1:n+q) = z(1:q);
        n = n + q;
        k = k + 1;
    end

end`,
  },
]
