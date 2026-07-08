function [S, tau, U] = bs_cn(r, sigma, T, Smax, NS, Nt, u0, ua, ub)
    % Crank-Nicolson for U_t = 0.5*sigma^2*S^2*U_SS + r*S*U_S - r*U on 0 < S < Smax, 0 <= tau <= T
    
    
    % time step
    ht  = T / Nt;
    
    % spatial and time grids
    S   = linspace(0, Smax, NS + 1)';
    tau = linspace(0, T, Nt + 1);
    
    % initialise solution matrix
    U = zeros(NS + 1, Nt + 1);
    
    % initial condition
    U(:, 1) = arrayfun(u0, S);
    
    % boundary conditions
    U(1, :) = arrayfun(ua, tau);
    U(end, :) = arrayfun(ub, tau);
    
    % interior indices
    i = (1:NS-1)';
    
    % coefficients of tridiagonal matrices
    a = -(sigma^2 * ht / 4) .* (i.^2) + (r * ht / 4) .* i;
    b = 1 + (sigma^2 * ht / 2) .* (i.^2) + (r * ht / 2);
    c = -(sigma^2 * ht / 4) .* (i.^2) - (r * ht / 4) .* i;
    d = 1 - (sigma^2 * ht / 2) .* (i.^2) - (r * ht / 2);
    
    % build matrices A and B
    % S = spdiags(B,d,m,n) - https://www.mathworks.com/help/matlab/math/constructing-sparse-matrices.html
    A = spdiags([[a(2:end); 0], b, [0; c(1:end-1)]], [-1 0 1], NS-1, NS-1);
    B = spdiags([[-a(2:end); 0], d, [0; -c(1:end-1)]], [-1 0 1], NS-1, NS-1);
    
    % LU decomposition of A
    Adec = decomposition(A, 'lu');
    
    for n = 1:Nt
        rhs = B * U(2:NS, n);
    
        rhs(1)   = rhs(1)   - a(1)   * (U(1,   n+1) + U(1,   n));
        rhs(end) = rhs(end) - c(end) * (U(end, n+1) + U(end, n));
    
        U(2:NS, n+1) = Adec \ rhs;
    end
end