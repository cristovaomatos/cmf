% Project 2 - Question 2
% Approximate alpha -> |A_alpha| using MC and QMC.

clear
clc
close all

% ####################################################
% Area curve for alpha in [-1,1]
% ####################################################


% Parameters
N = 1e6;
M = 1000;
seed_x = 123;
seed_y = 456;

alpha = linspace(-1, 1, M)';

% MC points
x_mc = randu01(N, seed_x);
y_mc = randu01(N, seed_y);

% QMC points
H = halton_nodes(N);
x_qmc = H(:,1);
y_qmc = H(:,2);

% Function values
f_mc = fxy(x_mc, y_mc);
f_qmc = fxy(x_qmc, y_qmc);

% Area estimates
area_mc = area_curve(f_mc, alpha);
area_qmc = area_curve(f_qmc, alpha);

% Plot
figure
plot(alpha, area_mc, '.', 'MarkerSize', 8)
hold on
plot(alpha, area_qmc, '.', 'MarkerSize', 8)

title('\alpha \rightarrow |A_\alpha|')
xlabel('\alpha')
ylabel('|A_\alpha|')
legend('MC', 'QMC', 'Location', 'northwest')
grid on
box on

% ####################################################
% Error comparison for alpha = 0.5
% ####################################################

% Representative alpha value for the error table
alpha0 = 0.5;

% Sample sizes to compare against the reference estimate
N_list = [1000; 10000; 100000; 1000000];

% Reference estimate computed with a large Halton sample
N_ref = 5000000;
H_ref = halton_nodes(N_ref);
f_ref = fxy(H_ref(:,1), H_ref(:,2));
I_ref = mean(f_ref < alpha0);


% Allocate result vectors
I_mc = zeros(length(N_list),1);
I_qmc = zeros(length(N_list),1);
err_mc = zeros(length(N_list),1);
err_qmc = zeros(length(N_list),1);

% Compute MC and QMC estimates for each sample size
for i = 1:length(N_list)

    Ni = N_list(i);

    % Monte Carlo estimate
    x_mc_i = randu01(Ni, seed_x);
    y_mc_i = randu01(Ni, seed_y);
    f_mc_i = fxy(x_mc_i, y_mc_i);

    I_mc(i) = mean(f_mc_i < alpha0);
    err_mc(i) = abs(I_ref - I_mc(i));

    % Quasi-Monte Carlo estimate
    H_i = halton_nodes(Ni);
    f_qmc_i = fxy(H_i(:,1), H_i(:,2));

    I_qmc(i) = mean(f_qmc_i < alpha0);
    err_qmc(i) = abs(I_ref - I_qmc(i));

end


% Display results as a table
results = table(N_list, I_mc, err_mc, I_qmc, err_qmc, ...
    'VariableNames', {'N', 'MC', 'AbsErr_MC', 'QMC', 'AbsErr_QMC'});

disp(results)


%% Local functions

function z = fxy(x, y)
    % Evaluate the function defining the sets A_alpha.

    z = sin(10*(x.^2 - sin(3*y)));

end

function area = area_curve(fvals, alpha)
    % Estimate P(f(X,Y) < alpha) for all alpha values.
    % Cumulative bin counts avoid looping over the alpha grid.

    edges = [-Inf; alpha(:); Inf];
    counts = histcounts(fvals, edges)';

    area = cumsum(counts);
    area = area(1:end-1) / length(fvals);

end