> 狀態：初始為 [x]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、驗證權限...

---

## [x] 【前端元素】應顯示「管理後台」標題、「返回」連結和「登出」按鈕
**範例輸入**：render `<AdminPage />`，mock user `{ username: 'dean', role: 'admin' }`
**期待輸出**：畫面上存在「🛠️ 管理後台」標題、`← 返回` 連結、「登出」按鈕

---

## [x] 【前端元素】user.role 為 `admin` 時，role badge 應顯示「管理員」
**範例輸入**：render `<AdminPage />`，mock user `{ role: 'admin' }`
**期待輸出**：畫面顯示文字「管理員」

---

## [x] 【前端元素】user.role 為 `user` 時，role badge 應顯示「一般用戶」
**範例輸入**：render `<AdminPage />`，mock user `{ role: 'user' }`
**期待輸出**：畫面顯示文字「一般用戶」

---

## [x] 【前端元素】「← 返回」連結應指向 `/dashboard`
**範例輸入**：render `<AdminPage />`
**期待輸出**：`← 返回` 的 `<a>` href 為 `/dashboard`

---

## [x] 【function 邏輯】點擊「登出」按鈕時，應呼叫 `logout()` 並導向 `/login`
**範例輸入**：render `<AdminPage />`，點擊「登出」按鈕
**期待輸出**：`logout()` 被呼叫一次，`navigate('/login', { replace: true, state: null })` 被呼叫
