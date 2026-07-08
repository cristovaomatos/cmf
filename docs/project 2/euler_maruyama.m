function [t, X, dB, B] = euler_maruyama(a, b, x0, T, N, seed)
    % Solve dX = a(t,X)dt + b(t,X)dB using Euler-Maruyama.
    % Method: Euler-Maruyama algorithm from the lecture notes (page 141).
    % Brownian increments are Delta B_i = sqrt(h) Z_i, Z_i ~ N(0,1).

    h = T / N;
    t = linspace(0, T, N+1)';

    dB = sqrt(h) * randn_ar(N, seed);
    B = [0; cumsum(dB)];

    X = zeros(N+1,1);
    X(1) = x0;

    for i = 1:N
        X(i+1) = X(i) ...
               + a(t(i), X(i)) * h ...
               + b(t(i), X(i)) * dB(i);
    end

end