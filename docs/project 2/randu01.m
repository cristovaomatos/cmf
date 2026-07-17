function [x, seed_out] = randu01(N, seed)
    % Generate N pseudo-random realizations of U([0,1])
    % using the linear congruential generator function lcg.
    [x, seed_out] = lcg(N, seed, 0, 1);

end
