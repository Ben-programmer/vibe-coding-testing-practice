import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AdminPage } from './AdminPage';

// ─── Mock react-router-dom navigate ─────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// ─── Mock useAuth ────────────────────────────────────────────────────────────
const mockLogout = vi.fn();

let mockAuthState = {
    user: { username: 'dean', role: 'admin' as 'admin' | 'user' },
    token: 'fake.jwt.token',
    isLoading: false,
    isAuthenticated: true,
    authExpiredMessage: null,
    login: vi.fn(),
    logout: mockLogout,
    checkAuth: vi.fn(),
    clearAuthExpiredMessage: vi.fn(),
};

vi.mock('../context/AuthContext', () => ({
    useAuth: () => mockAuthState,
}));

// ─── Helper ──────────────────────────────────────────────────────────────────
const renderAdminPage = () =>
    render(
        <MemoryRouter initialEntries={['/admin']}>
            <AdminPage />
        </MemoryRouter>
    );

// ─────────────────────────────────────────────────────────────────────────────

describe('AdminPage', () => {
    beforeEach(() => {
        mockAuthState = {
            user: { username: 'dean', role: 'admin' },
            token: 'fake.jwt.token',
            isLoading: false,
            isAuthenticated: true,
            authExpiredMessage: null,
            login: vi.fn(),
            logout: mockLogout,
            checkAuth: vi.fn(),
            clearAuthExpiredMessage: vi.fn(),
        };
        mockNavigate.mockReset();
        mockLogout.mockReset();
    });

    // ── 前端元素 ───────────────────────────────────────────────────────────────

    describe('前端元素', () => {
        it('應顯示「管理後台」標題、「返回」連結和「登出」按鈕', () => {
            renderAdminPage();
            expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: '← 返回' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
        });

        it('user.role 為 `admin` 時，role badge 應顯示「管理員」', () => {
            mockAuthState.user = { username: 'dean', role: 'admin' };
            renderAdminPage();
            expect(screen.getByText('管理員')).toBeInTheDocument();
        });

        it('user.role 為 `user` 時，role badge 應顯示「一般用戶」', () => {
            mockAuthState.user = { username: 'alice', role: 'user' };
            renderAdminPage();
            expect(screen.getByText('一般用戶')).toBeInTheDocument();
        });

        it('「← 返回」連結應指向 `/dashboard`', () => {
            renderAdminPage();
            const backLink = screen.getByRole('link', { name: '← 返回' });
            expect(backLink).toHaveAttribute('href', '/dashboard');
        });
    });

    // ── function 邏輯 ─────────────────────────────────────────────────────────

    describe('function 邏輯', () => {
        it('點擊「登出」按鈕時，應呼叫 `logout()` 並導向 `/login`', () => {
            renderAdminPage();
            fireEvent.click(screen.getByRole('button', { name: '登出' }));
            expect(mockLogout).toHaveBeenCalledOnce();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });
});
