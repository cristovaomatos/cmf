% Project 2 - Question 4b)
% Estimate strong and weak convergence orders for Euler-Maruyama and Milstein.
% GBM structure is used to compute terminal values by log-products.

clear
clc
close all

% Parameters
S0 = 10;
T = 1;
mu = 0.6;
sigma = 0.25;
M = 1e6;
seed = 123;

hvals = 0.005 * (1/2).^(0:3)';
Nvals = round(T ./ hvals);
L = length(hvals);

% Storage
strong_em  = zeros(L,1);
strong_mil = zeros(L,1);
weak_em    = zeros(L,1);
weak_mil   = zeros(L,1);

% Constants
sig2 = sigma^2;
exact_drift = (mu - 0.5*sig2) * T;
mil_coeff = 0.5 * sig2;

for k = 1:L

    h = hvals(k);
    N = Nvals(k);
    sqrth = sqrt(h);

    rng(seed + k)

    log_em  = zeros(1,M);
    log_mil = zeros(1,M);
    BT      = zeros(1,M);

    for i = 1:N

        dB = sqrth * randn(1,M);

        log_em = log_em + log1p(mu*h + sigma*dB);

        log_mil = log_mil + log1p(mu*h + sigma*dB ...
                  + mil_coeff*(dB.^2 - h));

        BT = BT + dB;

    end

    % Exact and numerical terminal values
    S_exact = S0 * exp(exact_drift + sigma*BT);
    S_em    = S0 * exp(log_em);
    S_mil   = S0 * exp(log_mil);

    % Errors
    err_em  = S_exact - S_em;
    err_mil = S_exact - S_mil;

    strong_em(k)  = mean(abs(err_em));
    strong_mil(k) = mean(abs(err_mil));

    weak_em(k)  = abs(mean(err_em));
    weak_mil(k) = abs(mean(err_mil));

    fprintf('h = %.7f | Strong EM = %.4e | Strong Milstein = %.4e | Weak EM = %.4e | Weak Milstein = %.4e\n', ...
            h, strong_em(k), strong_mil(k), weak_em(k), weak_mil(k));

end

% Convergence orders: log(error) = c + p log(h)
p_strong_em  = polyfit(log(hvals), log(strong_em), 1);
p_strong_mil = polyfit(log(hvals), log(strong_mil), 1);
p_weak_em    = polyfit(log(hvals), log(weak_em), 1);
p_weak_mil   = polyfit(log(hvals), log(weak_mil), 1);

order_strong_em  = p_strong_em(1);
order_strong_mil = p_strong_mil(1);
order_weak_em    = p_weak_em(1);
order_weak_mil   = p_weak_mil(1);

% Results table
results = table(hvals, Nvals, strong_em, strong_mil, weak_em, weak_mil, ...
    'VariableNames', {'h', 'N', 'Strong_EM', 'Strong_Milstein', ...
                      'Weak_EM', 'Weak_Milstein'});

disp(results)

fprintf('\nEstimated convergence orders:\n')
fprintf('Strong Euler-Maruyama: %.4f\n', order_strong_em)
fprintf('Strong Milstein: %.4f\n', order_strong_mil)
fprintf('Weak Euler-Maruyama: %.4f\n', order_weak_em)
fprintf('Weak Milstein: %.4f\n', order_weak_mil)

% Strong convergence plot
figure
loglog(hvals, strong_em, 'o-', 'LineWidth', 1.5)
hold on
loglog(hvals, strong_mil, 's-', 'LineWidth', 1.5)

title('Strong convergence')
xlabel('h')
ylabel('E(|S(T) - S_N|)')
legend(sprintf('Euler-Maruyama, order %.2f', order_strong_em), ...
       sprintf('Milstein, order %.2f', order_strong_mil), ...
       'Location', 'northwest')
grid on
box on

% Weak convergence plot
figure
loglog(hvals, weak_em, 'o-', 'LineWidth', 1.5)
hold on
loglog(hvals, weak_mil, 's-', 'LineWidth', 1.5)

title('Weak convergence')
xlabel('h')
ylabel('|E(S(T) - S_N)|')
legend(sprintf('Euler-Maruyama, order %.2f', order_weak_em), ...
       sprintf('Milstein, order %.2f', order_weak_mil), ...
       'Location', 'northwest')
grid on
box on