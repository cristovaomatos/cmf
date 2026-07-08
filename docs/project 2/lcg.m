function x = lcg(N, seed, a, b)
    
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

    % Scale U(0,1) to U(a,b)
    x = a + (b-a)*x;

end

