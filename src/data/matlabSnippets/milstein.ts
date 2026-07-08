import type { MatlabSnippet } from './types'

export const milsteinSnippets: MatlabSnippet[] = [
  {
    id: 'milstein-full',
    label: 'Milstein implementation',
    code: `function [t, X, dB, B] = milstein(a, b, db, x0, T, N, seed)
    % Solve dX = a(t,X)dt + b(t,X)dB using Milstein method.
    % Method: Milstein algorithm from the lecture notes (page 143).
    % db is the derivative of b(t,X) with respect to X.

    h = T / N;
    t = linspace(0, T, N+1)';

    dB = sqrt(h) * randn_ar(N, seed);
    B = [0; cumsum(dB)];

    X = zeros(N+1,1);
    X(1) = x0;

    for i = 1:N
        ti = t(i);
        Xi = X(i);

        X(i+1) = Xi ...
               + a(ti, Xi) * h ...
               + b(ti, Xi) * dB(i) ...
               + 0.5 * b(ti, Xi) * db(ti, Xi) * (dB(i)^2 - h);
    end

end`,
  },
]
