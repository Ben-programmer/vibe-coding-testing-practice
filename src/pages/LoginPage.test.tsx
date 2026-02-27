import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LoginPage } from './LoginPage';

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
const mockLogin = vi.fn();
const mockClearAuthExpiredMessage = vi.fn();

const defaultAuthState = {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    authExpiredMessage: null,
    login: mockLogin,
    logout: vi.fn(),
    checkAuth: vi.fn(),
    clearAuthExpiredMessage: mockClearAuthExpiredMessage,
};

vi.mock('../context/AuthContext', () => ({
    useAuth: () => mockAuthState,
}));

let mockAuthState = { ...defaultAuthState };

// ─── Helper ──────────────────────────────────────────────────────────────────
const renderLoginPage = () =>
    render(
        <MemoryRouter>
            <LoginPage />
        </MemoryRouter>
    );

// ─────────────────────────────────────────────────────────────────────────────

describe('LoginPage', () => {
    beforeEach(() => {
        mockAuthState = { ...defaultAuthState };
        mockLogin.mockReset();
        mockNavigate.mockReset();
        mockClearAuthExpiredMessage.mockReset();
    });

    // ── 前端元素 ───────────────────────────────────────────────────────────────

    describe('前端元素', () => {
        it('頁面初始渲染時，應顯示 Email 輸入欄、密碼輸入欄和登入按鈕', () => {
            renderLoginPage();
            expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
            expect(screen.getByLabelText('密碼')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
        });

        it('初始渲染時，不應顯示任何 Email 或密碼的錯誤訊息', () => {
            renderLoginPage();
            expect(screen.queryByText('請輸入有效的 Email 格式')).not.toBeInTheDocument();
            expect(screen.queryByText('密碼必須至少 8 個字元')).not.toBeInTheDocument();
            expect(screen.queryByText('密碼必須包含英文字母和數字')).not.toBeInTheDocument();
        });

        it('初始渲染時，不應顯示 API 錯誤橫幅', () => {
            renderLoginPage();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    // ── function 邏輯 ─────────────────────────────────────────────────────────

    describe('function 邏輯', () => {
        it('輸入格式不正確的 Email，應顯示「請輸入有效的 Email 格式」', async () => {
            renderLoginPage();
            await userEvent.type(screen.getByLabelText('電子郵件'), 'notanemail');
            await userEvent.type(screen.getByLabelText('密碼'), 'abc12345');
            fireEvent.click(screen.getByRole('button', { name: '登入' }));
            expect(await screen.findByText('請輸入有效的 Email 格式')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('Email 欄位留空，應顯示「請輸入有效的 Email 格式」', async () => {
            renderLoginPage();
            await userEvent.type(screen.getByLabelText('密碼'), 'abc12345');
            fireEvent.click(screen.getByRole('button', { name: '登入' }));
            expect(await screen.findByText('請輸入有效的 Email 格式')).toBeInTheDocument();
        });

        it('密碼長度不足 8 字元，應顯示「密碼必須至少 8 個字元」', async () => {
            renderLoginPage();
            await userEvent.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await userEvent.type(screen.getByLabelText('密碼'), 'abc1');
            fireEvent.click(screen.getByRole('button', { name: '登入' }));
            expect(await screen.findByText('密碼必須至少 8 個字元')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('密碼不含數字，應顯示「密碼必須包含英文字母和數字」', async () => {
            renderLoginPage();
            await userEvent.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await userEvent.type(screen.getByLabelText('密碼'), 'abcdefgh');
            fireEvent.click(screen.getByRole('button', { name: '登入' }));
            expect(await screen.findByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
        });

        it('密碼不含英文字母，應顯示「密碼必須包含英文字母和數字」', async () => {
            renderLoginPage();
            await userEvent.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await userEvent.type(screen.getByLabelText('密碼'), '12345678');
            fireEvent.click(screen.getByRole('button', { name: '登入' }));
            expect(await screen.findByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
        });

        it('Email 與密碼同時無效，應同時顯示兩個欄位的錯誤訊息', async () => {
            renderLoginPage();
            await userEvent.type(screen.getByLabelText('電子郵件'), 'bad');
            await userEvent.type(screen.getByLabelText('密碼'), '123');
            fireEvent.click(screen.getByRole('button', { name: '登入' }));
            expect(await screen.findByText('請輸入有效的 Email 格式')).toBeInTheDocument();
            expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();
        });
    });

    // ── Mock API ──────────────────────────────────────────────────────────────

    describe('Mock API', () => {
        it('送出合法憑證時，應呼叫 `login()` 並導向 `/dashboard`', async () => {
            mockLogin.mockResolvedValueOnce(undefined);
            renderLoginPage();
            await userEvent.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await userEvent.type(screen.getByLabelText('密碼'), 'abc12345');
            fireEvent.click(screen.getByRole('button', { name: '登入' }));
            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledOnce();
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'abc12345');
            });
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });

        it('登入中 (isLoading) 時，輸入欄與按鈕應為 disabled 且顯示「登入中...」', async () => {
            let resolveLogin!: () => void;
            mockLogin.mockReturnValueOnce(
                new Promise<void>((res) => {
                    resolveLogin = res;
                })
            );
            renderLoginPage();
            await userEvent.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await userEvent.type(screen.getByLabelText('密碼'), 'abc12345');
            fireEvent.click(screen.getByRole('button', { name: '登入' }));

            await waitFor(() => {
                expect(screen.getByText('登入中...')).toBeInTheDocument();
                expect(screen.getByLabelText('電子郵件')).toBeDisabled();
                expect(screen.getByLabelText('密碼')).toBeDisabled();
            });

            // 清理：resolve promise
            resolveLogin();
        });

        it('API 回傳錯誤（如 401），應顯示後端回傳的錯誤訊息', async () => {
            const axiosError = {
                response: { data: { message: '帳號或密碼錯誤' } },
            };
            mockLogin.mockRejectedValueOnce(axiosError);
            renderLoginPage();
            await userEvent.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await userEvent.type(screen.getByLabelText('密碼'), 'abc12345');
            fireEvent.click(screen.getByRole('button', { name: '登入' }));
            expect(await screen.findByRole('alert')).toHaveTextContent('帳號或密碼錯誤');
        });

        it('API 無回傳訊息時，應顯示預設錯誤「登入失敗，請稍後再試」', async () => {
            mockLogin.mockRejectedValueOnce({});
            renderLoginPage();
            await userEvent.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await userEvent.type(screen.getByLabelText('密碼'), 'abc12345');
            fireEvent.click(screen.getByRole('button', { name: '登入' }));
            expect(await screen.findByRole('alert')).toHaveTextContent('登入失敗，請稍後再試');
        });
    });

    // ── 驗證權限 ──────────────────────────────────────────────────────────────

    describe('驗證權限', () => {
        it('已登入狀態下訪問登入頁，應自動導向 `/dashboard`', () => {
            mockAuthState = { ...defaultAuthState, isAuthenticated: true };
            renderLoginPage();
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });

        it('`authExpiredMessage` 有值時，應顯示該訊息並清除', async () => {
            mockAuthState = {
                ...defaultAuthState,
                authExpiredMessage: '登入已過期，請重新登入',
            };
            renderLoginPage();
            expect(await screen.findByRole('alert')).toHaveTextContent('登入已過期，請重新登入');
            expect(mockClearAuthExpiredMessage).toHaveBeenCalledOnce();
        });
    });
});
