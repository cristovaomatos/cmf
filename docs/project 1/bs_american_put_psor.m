function [S, tau, U, Sf] = bs_american_put_psor(r, sigma, T, K, Smax, NS, Nt, omega, tol, max_iter)
    % American put by Crank-Nicolson + PSOR
    % U(S,tau), tau = T - t
    
    % grid spacing
    hS  = Smax / NS;
    ht  = T / Nt;
    
    % spatial and time grids
    S   = linspace(0, Smax, NS + 1)';
    tau = linspace(0, T, Nt + 1);
    
    % initialise...
    U = zeros(NS + 1, Nt + 1);
    
    % initial condition (payoff)
    U(:,1) = max(K - S, 0);
    
    % Boundary conditions
    U(1,:)   = K;
    U(end,:) = 0;
    
    % interior indices
    i = (1:NS-1)';
    
    % coefficients
    a = -(sigma^2 * ht / 4) .* (i.^2) + (r * ht / 4) .* i;
    b = 1 + (sigma^2 * ht / 2) .* (i.^2) + (r * ht / 2);
    c = -(sigma^2 * ht / 4) .* (i.^2) - (r * ht / 4) .* i;
    d = 1 - (sigma^2 * ht / 2) .* (i.^2) - (r * ht / 2);
    
    % build matrices
    A = spdiags([[a(2:end); 0], b, [0; c(1:end-1)]], [-1 0 1], NS-1, NS-1);
    B = spdiags([[-a(2:end); 0], d, [0; -c(1:end-1)]], [-1 0 1], NS-1, NS-1);
    
    % matrix splitting for PSOR-style iteration
    L = tril(A, -1);
    D = spdiags(diag(A), 0, NS-1, NS-1);
    R = triu(A, 1);
    
    M1 = D + omega * L;
    M2 = (1 - omega) * D - omega * R;
    
    % obstacle (payoff inside domain)
    g = max(K - S(2:NS), 0);
    
    % free boundary
    Sf = zeros(Nt + 1, 1);
    Sf(1) = K;
    
    for n = 1:Nt
        % right-hand side
        rhs = B * U(2:NS, n);
    
        % boundary contributions
        rhs(1)   = rhs(1)   - a(1)   * U(1, n+1)   + a(1)   * U(1, n);
        rhs(end) = rhs(end) - c(end) * U(end, n+1) + c(end) * U(end, n);
    
        % complementarity formulation from the notes:
        % x = w - g >= 0, with btilde = rhs - A*g
        btilde = rhs - A * g;
    
        % initial guess
        x_old = max(U(2:NS, n) - g, 0);
    
        err = inf;
        iter = 0;
    
        % PSOR iteration
        while err > tol && iter < max_iter
            z = M1 \ (M2 * x_old + omega * btilde);
            x = max(0, z);
    
            err = norm(x - x_old, inf);
            x_old = x;
            iter = iter + 1;
        end
    
        % recover solution
        w = x + g;
        U(2:NS, n+1) = w;
    
        % Free boundary extraction
        payoff_now = max(K - S, 0);
        diff_now = U(:, n+1) - payoff_now;
    
        % first continuation point
        idx = find(diff_now > 1e-8, 1, 'first');
    
        if isempty(idx)
            Sf(n+1) = Smax;
        elseif idx == 1
            Sf(n+1) = 0;
        else
            % linear interpolation
            sL = S(idx-1);
            sR = S(idx);
            dL = diff_now(idx-1);
            dR = diff_now(idx);
    
            if abs(dR - dL) < 1e-14
                Sf(n+1) = sL;
            else
                Sf(n+1) = sL - dL * (sR - sL) / (dR - dL);
            end
        end
    end
end