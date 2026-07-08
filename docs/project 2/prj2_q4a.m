% Project 2 - Question 4a)
% Compare exact GBM solution with Euler-Maruyama and Milstein.
% Uses external routines: euler_maruyama.m and milstein.m.

clear
clc
close all

% Parameters
S0 = 10;
T = 1;
mu = 0.6;
sigma = 0.25;
h = 0.001;
seed = 123;

N = round(T / h);
h = T / N;

% GBM coefficients: dS = mu*S dt + sigma*S dB
a  = @(t,x) mu*x;
b  = @(t,x) sigma*x;
db = @(t,x) sigma;

% Euler-Maruyama path
[t, S_em, dB, B] = euler_maruyama(a, b, S0, T, N, seed);

% Milstein path using the same Brownian realization
[~, S_mil, ~, ~] = milstein(a, b, db, S0, T, N, seed);

% Exact GBM solution using the same Brownian path
S_exact = S0 * exp((mu - 0.5*sigma^2)*t + sigma*B);

% Plot exact solution, Euler-Maruyama and Milstein in the same figure
figure
plot(t, S_exact, 'LineWidth', 1.5)
hold on
plot(t, S_em, '--', 'LineWidth', 1.2)
plot(t, S_mil, ':', 'LineWidth', 1.5)

title('Exact solution vs Euler-Maruyama and Milstein')
xlabel('t')
ylabel('S(t)')
legend('Exact solution', 'Euler-Maruyama', 'Milstein', ...
       'Location', 'northwest')
grid on
box on