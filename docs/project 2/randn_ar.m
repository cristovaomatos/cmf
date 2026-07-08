% randn_ar.m
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

end