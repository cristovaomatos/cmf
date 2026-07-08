clear; clc; close all;

set(0,'defaultFigureColor','w')
set(0,'defaultAxesColor','w')
set(0,'defaultAxesXColor','k')
set(0,'defaultAxesYColor','k')
set(0,'defaultAxesGridColor',[0.8 0.8 0.8])
set(0,'defaultAxesFontSize',11)

% -------------------------------------------------------------------------
% 1 - Parameters
% -------------------------------------------------------------------------

r = 0.06;  % interest rate
sigma = 0.3;   % volatility
T = 1;   % maturity
K = 10;   % strike
Smax = 15;    % truncated spatial domain

NS = 800;    % spacial steps
Nt = 10000;    % time steps

omega = 1.2;    % relaxation param
tol = 1e-8;   % stop tolerance
max_iter = 10000;   % maximum iterations

% -------------------------------------------------------------------------
% 2 - Solve American put (CN + PSOR)
% -------------------------------------------------------------------------

% solve PDE with early exercise constraint
[S, tau, U, Sf_tau] = bs_american_put_psor(r, sigma, T, K, Smax, NS, Nt, omega, tol, max_iter);

% recover physical time
t = linspace(0, T, length(tau));
V = U(:, end:-1:1);

% reverse free boundary
Sf = Sf_tau(end:-1:1);

% -------------------------------------------------------------------------
% 3 - Profiles at selected times
% -------------------------------------------------------------------------
t_plot = [0, 0.5, 1];

% find indices corresponding to selected times
idx = arrayfun(@(x) find(abs(t - x) == min(abs(t - x)), 1), t_plot);

figure;
plot(S, V(:, idx(1)), 'r', 'LineWidth', 1.2); hold on;
plot(S, V(:, idx(2)), 'g', 'LineWidth', 1.2);
plot(S, V(:, idx(3)), 'b', 'LineWidth', 1.2);
xlabel('S');
ylabel('V(S,t)');
title('American put option');
legend('t=0','t=0.5','t=1','Location','northeast');
xlim([0 Smax]);
ylim([0 K]);
grid on;
box on;

% -------------------------------------------------------------------------
% 4 - Continuation region plot
% -------------------------------------------------------------------------

% transpose for surface plotting
Vt = V';

% mask exercise region
V_cont = Vt;
V_cont(bsxfun(@le, S', Sf)) = NaN;

% adjust plotting range near free boundary
smin = floor(min(Sf) * 10) / 10;

if smin > 0.5
    smin = smin - 0.2;
end

figure;
surf(S, t, V_cont, 'EdgeColor','none');
view(2);
xlabel('S');
ylabel('t');
title('Continuation region');
colormap(parula);
xlim([smin Smax]);
ylim([0 T]);
grid on;
box on;