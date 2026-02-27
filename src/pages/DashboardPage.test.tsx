import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DashboardPage } from './DashboardPage';

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
    user: { username: 'dean', role: 'admin' as 'admin' | 'user' } as { username: string; role: 'admin' | 'user' } | null,
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

// ─── Mock productApi ──────────────────────────────────────────────────────────
const mockGetProducts = vi.fn();
vi.mock('../api/productApi', () => ({
    productApi: {
        getProducts: () => mockGetProducts(),
    },
}));

const mockProducts = [
    { id: 1, name: '筆記型電腦', price: 25000, description: '輕薄高效能筆記型電腦，適合工作與娛樂' },
    { id: 2, name: '無線滑鼠', price: 890, description: '人體工學設計，支援多裝置連接' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const renderDashboardPage = () =>
    render(
        <MemoryRouter initialEntries={['/dashboard']}>
            <DashboardPage />
        </MemoryRouter>
    );

// ──────────────────────────────────────────────────────────────────────────────

describe('DashboardPage', () => {
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
        mockGetProducts.mockResolvedValue(mockProducts);
    });

    // ── 前端元素 ──────────────────────────────────────────────────────────────

    describe('前端元素', () => {
        it('應顯示用戶 username 的首字母作為 Avatar 與歡迎訊息', async () => {
            renderDashboardPage();
            expect(await screen.findByText('D')).toBeInTheDocument();
            expect(screen.getByText('Welcome, dean 👋')).toBeInTheDocument();
        });

        it('user 為 null 時，Avatar 應顯示「?」，歡迎訊息應顯示「Welcome, User 👋」', async () => {
            mockAuthState = { ...mockAuthState, user: null };
            renderDashboardPage();
            expect(await screen.findByText('?')).toBeInTheDocument();
            expect(screen.getByText('Welcome, User 👋')).toBeInTheDocument();
        });

        it('user.role 為 `admin` 時，應顯示「管理後台」連結與「管理員」role badge', async () => {
            renderDashboardPage();
            await waitFor(() => {
                expect(screen.getByRole('link', { name: /管理後台/ })).toHaveAttribute('href', '/admin');
                expect(screen.getByText('管理員')).toBeInTheDocument();
            });
        });

        it('user.role 為 `user` 時，不應顯示「管理後台」連結，role badge 顯示「一般用戶」', async () => {
            mockAuthState = { ...mockAuthState, user: { username: 'alice', role: 'user' } };
            renderDashboardPage();
            await waitFor(() => {
                expect(screen.queryByRole('link', { name: /管理後台/ })).not.toBeInTheDocument();
                expect(screen.getByText('一般用戶')).toBeInTheDocument();
            });
        });
    });

    // ── Mock API ──────────────────────────────────────────────────────────────

    describe('Mock API', () => {
        it('商品載入中時，應顯示「載入商品中...」', () => {
            // 使用不會 resolve 的 promise 讓 loading 持續
            mockGetProducts.mockReturnValueOnce(new Promise(() => { }));
            renderDashboardPage();
            expect(screen.getByText('載入商品中...')).toBeInTheDocument();
        });

        it('API 成功回傳商品時，應渲染商品名稱、描述和價格', async () => {
            renderDashboardPage();
            expect(await screen.findByText('筆記型電腦')).toBeInTheDocument();
            expect(screen.getByText('NT$ 25,000')).toBeInTheDocument();
        });

        it('API 回傳非 401 錯誤時，應顯示後端錯誤訊息', async () => {
            mockGetProducts.mockRejectedValueOnce({
                response: { status: 500, data: { message: '伺服器錯誤' } },
            });
            renderDashboardPage();
            expect(await screen.findByText('伺服器錯誤')).toBeInTheDocument();
        });

        it('API 回傳非 401 錯誤且無訊息時，應顯示預設錯誤「無法載入商品資料」', async () => {
            mockGetProducts.mockRejectedValueOnce({ response: { status: 500 } });
            renderDashboardPage();
            expect(await screen.findByText('無法載入商品資料')).toBeInTheDocument();
        });

        it('API 回傳 401 時，不顯示錯誤訊息（由 axios interceptor 處理）', async () => {
            mockGetProducts.mockRejectedValueOnce({
                response: { status: 401, data: { message: '未授權' } },
            });
            renderDashboardPage();
            // isLoading 結束後，不顯示任何錯誤
            await waitFor(() => {
                expect(screen.queryByText('未授權')).not.toBeInTheDocument();
                expect(screen.queryByText('無法載入商品資料')).not.toBeInTheDocument();
            });
        });
    });

    // ── function 邏輯 ─────────────────────────────────────────────────────────

    describe('function 邏輯', () => {
        it('點擊「登出」按鈕時，應呼叫 `logout()` 並導向 `/login`', async () => {
            renderDashboardPage();
            // 等 loading 結束才點按鈕
            await screen.findByText('筆記型電腦');
            fireEvent.click(screen.getByRole('button', { name: '登出' }));
            expect(mockLogout).toHaveBeenCalledOnce();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });
});
