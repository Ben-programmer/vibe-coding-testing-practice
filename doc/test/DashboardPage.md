> 狀態：初始為 [x]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】應顯示用戶 username 的首字母作為 Avatar 與歡迎訊息
**範例輸入**：render `<DashboardPage />`，mock user `{ username: 'dean', role: 'admin' }`
**期待輸出**：Avatar 顯示「D」，歡迎文字顯示「Welcome, dean 👋」

---

## [x] 【前端元素】user 為 null 時，Avatar 應顯示「?」，歡迎訊息應顯示「Welcome, User 👋」
**範例輸入**：render `<DashboardPage />`，mock user `null`
**期待輸出**：Avatar 顯示「?」，歡迎文字包含「Welcome, User 👋」

---

## [x] 【前端元素】user.role 為 `admin` 時，應顯示「管理後台」連結與「管理員」role badge
**範例輸入**：render `<DashboardPage />`，mock user `{ role: 'admin' }`
**期待輸出**：畫面存在「🛠️ 管理後台」連結（href = `/admin`），role badge 顯示「管理員」

---

## [x] 【前端元素】user.role 為 `user` 時，不應顯示「管理後台」連結，role badge 顯示「一般用戶」
**範例輸入**：render `<DashboardPage />`，mock user `{ role: 'user' }`
**期待輸出**：無「管理後台」連結，role badge 顯示「一般用戶」

---

## [x] 【Mock API】商品載入中時，應顯示「載入商品中...」
**範例輸入**：render `<DashboardPage />`，mock `productApi.getProducts` 為延遲 promise
**期待輸出**：畫面顯示「載入商品中...」

---

## [x] 【Mock API】API 成功回傳商品時，應渲染商品名稱、描述和價格
**範例輸入**：render `<DashboardPage />`，mock `productApi.getProducts` 回傳含 `{ name: '筆記型電腦', price: 25000, description: '...' }` 的陣列
**期待輸出**：畫面顯示「筆記型電腦」、「NT$ 25,000」

---

## [x] 【Mock API】API 回傳非 401 錯誤時，應顯示後端錯誤訊息
**範例輸入**：render `<DashboardPage />`，mock `productApi.getProducts` reject，回傳 `{ response: { status: 500, data: { message: '伺服器錯誤' } } }`
**期待輸出**：畫面顯示「伺服器錯誤」

---

## [x] 【Mock API】API 回傳非 401 錯誤且無訊息時，應顯示預設錯誤「無法載入商品資料」
**範例輸入**：render `<DashboardPage />`，mock `productApi.getProducts` reject，無 response.data.message
**期待輸出**：畫面顯示「無法載入商品資料」

---

## [x] 【Mock API】API 回傳 401 時，不顯示錯誤訊息（由 axios interceptor 處理）
**範例輸入**：render `<DashboardPage />`，mock `productApi.getProducts` reject，`{ response: { status: 401 } }`
**期待輸出**：畫面不顯示任何錯誤訊息

---

## [x] 【function 邏輯】點擊「登出」按鈕時，應呼叫 `logout()` 並導向 `/login`
**範例輸入**：render `<DashboardPage />`，點擊「登出」按鈕
**期待輸出**：`logout()` 被呼叫一次，`navigate('/login', { replace: true, state: null })` 被呼叫
