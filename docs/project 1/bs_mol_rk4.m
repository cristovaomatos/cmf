function [S, t, U] = bs_mol_rk4(r, sigma, T, Smax, NS, Nt, u0, ua, ub)
    % Method of lines + classical RK4 for U_t = 0.5*sigma^2*S^2*U_SS + r*S*U_S - r*U
    % on 0 < S < Smax, 0 <= t <= T
    
    
    % time step
    ht = T / Nt;
    
    % spatial and time grids
    S = linspace(0, Smax, NS + 1)';
    t = linspace(0, T, Nt + 1);
    
    % initialise solution matrix
    U = zeros(NS + 1, Nt + 1);
    
    % initial condition
    U(:,1) = arrayfun(u0, S);
    
    % boundary conditions
    U(1,:) = arrayfun(ua, t);
    U(end,:) = arrayfun(ub, t);
    
    % interior indices
    i = (1:NS-1)';
    
    % coefficients 
    alpha = 0.5 * sigma^2 * i.^2 - 0.5 * r * i;
    beta  = -sigma^2 * i.^2 - r;
    gamma = 0.5 * sigma^2 * i.^2 + 0.5 * r * i;
    
    % build tridiagonal matrix
    AML = spdiags([[alpha(2:end); 0], beta, [0; gamma(1:end-1)]], [-1 0 1], NS-1, NS-1);
    
    % initial interior values
    W = U(2:NS,1);
    
    % RK4 time stepping
    for n = 1:Nt
        tn = t(n);
    
        f1 = ht * rhs_mol(tn,         W,        AML, alpha, gamma, ua, ub);
        f2 = ht * rhs_mol(tn + ht/2,  W + f1/2, AML, alpha, gamma, ua, ub);
        f3 = ht * rhs_mol(tn + ht/2,  W + f2/2, AML, alpha, gamma, ua, ub);
        f4 = ht * rhs_mol(tn + ht,    W + f3,   AML, alpha, gamma, ua, ub);
    
        W = W + (f1 + 2*f2 + 2*f3 + f4) / 6;
    
        U(2:NS, n+1) = W;
    end

end

% rhs_mol function
function F = rhs_mol(tt, W, AML, alpha, gamma, ua, ub)

    % boundary contribution vector
    m = length(W);
    
    bML = zeros(m,1);
    bML(1)   = alpha(1)   * ua(tt);
    bML(end) = gamma(end) * ub(tt);
    
    % right-hand side of ODE system
    F = AML * W + bML;

end