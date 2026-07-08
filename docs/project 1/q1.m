clear; clc; close all;

set(0,'defaultFigureColor','w')
set(0,'defaultAxesFontSize',11)

% -------------------------------------------------------------------------
% 1 - Parameters
% -------------------------------------------------------------------------

r = 0.06;     % interest rate
sigma = 0.3;   % volatility
T = 1;    % maturity
K = 10;   % strike price
Smax = 15;    % trucated S

NS = 200;   % number of S steps
Nt_cn = 1000;   % number of time steps (CN)
Nt_mol = 4000;  % number of time steps (MOL+RK4)

% payoff and boundary conditions
u0 = @(S) max(K - S, 0);    % initial condition
ua = @(tau) K * exp(-r * tau);    % boundary at S=0
ub = @(tau) 0;     % boundary at S=Smax

t_plot = [0 0.5 1];   % times for profile plots

% -------------------------------------------------------------------------
% 2 - Crank-Nicolson
% -------------------------------------------------------------------------

% solve PDE using Crank-Nicolson
[S_cn, tau_cn, Ucn] = bs_cn(r, sigma, T, Smax, NS, Nt_cn, u0, ua, ub);

% reverse time to recover V(S,t)
Vcn = Ucn(:, end:-1:1);
t_cn = tau_cn;

% -------------------------------------------------------------------------
% 3 - Method of Lines + RK4
% -------------------------------------------------------------------------

% solve PDE using Method of Lines with RK4
[S_mol, tau_mol, Umol] = bs_mol_rk4(r, sigma, T, Smax, NS, Nt_mol, u0, ua, ub);


% reverse time to recover V(S,t)
Vmol = Umol(:, end:-1:1);

% -------------------------------------------------------------------------
% 4 - Surfaces
% -------------------------------------------------------------------------

% build grids for surface plots
[Tg_cn, Sg_cn] = meshgrid(t_cn, S_cn);
[Tg_mol, Sg_mol] = meshgrid(tau_mol, S_mol);

% CN surface
figure;
surf(Tg_cn, Sg_cn, Vcn, 'EdgeColor', 'none');
view(-135,30)
xlabel('t')
ylabel('S')
zlabel('V(S,t)')
title('European put option value, V(S,t) - CN')
xlim([0 T])
ylim([0 Smax])
zlim([0 K])
grid on
box on

% MOL surface
figure;
surf(Tg_mol, Sg_mol, Vmol, 'EdgeColor', 'none');
view(-135,30)
xlabel('t')
ylabel('S')
zlabel('V(S,t)')
title('European put option value, V(S,t) - MOL')
xlim([0 T])
ylim([0 Smax])
zlim([0 K])
grid on
box on

% -------------------------------------------------------------------------
% 5 - Profiles at selected times
% -------------------------------------------------------------------------

% find indices corresponding to selected times
idx_cn = arrayfun(@(x) find(abs(t_cn - x) == min(abs(t_cn - x)),1), t_plot);
idx_mol = arrayfun(@(x) find(abs(tau_mol - x) == min(abs(tau_mol - x)),1), t_plot);

% CN profiles
figure;
plot(S_cn, Vcn(:,idx_cn(1)), 'LineWidth', 1.2); hold on
plot(S_cn, Vcn(:,idx_cn(2)), 'LineWidth', 1.2)
plot(S_cn, Vcn(:,idx_cn(3)), 'LineWidth', 1.2)
xlabel('S')
ylabel('V(S,t)')
title('European put option - CN')
legend('t=0','t=0.5','t=1','Location','northeast')
xlim([0 Smax])
ylim([0 K])
grid on
box on


% MOL profiles
figure;
plot(S_mol, Vmol(:,idx_mol(1)), 'LineWidth', 1.2); hold on
plot(S_mol, Vmol(:,idx_mol(2)), 'LineWidth', 1.2)
plot(S_mol, Vmol(:,idx_mol(3)), 'LineWidth', 1.2)
xlabel('S')
ylabel('V(S,t)')
title('European put option - MOL')
legend('t=0','t=0.5','t=1','Location','northeast')
xlim([0 Smax])
ylim([0 K])
grid on
box on