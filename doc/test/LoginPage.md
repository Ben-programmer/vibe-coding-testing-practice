> 狀態：初始為 [x]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】頁面初始渲染時，應顯示 Email 輸入欄、密碼輸入欄和登入按鈕
**範例輸入**：render `<LoginPage />`  
**期待輸出**：畫面上存在 `#email` input、`#password` input、type="submit" 的登入按鈕

---

## [x] 【前端元素】初始渲染時，不應顯示任何 Email 或密碼的錯誤訊息
**範例輸入**：render `<LoginPage />`  
**期待輸出**：無 `field-error` span 顯示

---

## [x] 【前端元素】初始渲染時，不應顯示 API 錯誤橫幅
**範例輸入**：render `<LoginPage />`  
**期待輸出**：無 `role="alert"` 的元素顯示

---

## [x] 【function 邏輯】輸入格式不正確的 Email，應顯示「請輸入有效的 Email 格式」
**範例輸入**：email = `"notanemail"`, password = `"abc12345"`，按下登入
**期待輸出**：顯示錯誤訊息「請輸入有效的 Email 格式」，且 `login()` 不被呼叫

---

## [x] 【function 邏輯】Email 欄位留空，應顯示「請輸入有效的 Email 格式」
**範例輸入**：email = `""`, password = `"abc12345"`，按下登入
**期待輸出**：顯示錯誤訊息「請輸入有效的 Email 格式」

---

## [x] 【function 邏輯】密碼長度不足 8 字元，應顯示「密碼必須至少 8 個字元」
**範例輸入**：email = `"test@example.com"`, password = `"abc1"`，按下登入
**期待輸出**：顯示錯誤訊息「密碼必須至少 8 個字元」，且 `login()` 不被呼叫

---

## [x] 【function 邏輯】密碼不含數字，應顯示「密碼必須包含英文字母和數字」
**範例輸入**：email = `"test@example.com"`, password = `"abcdefgh"`，按下登入
**期待輸出**：顯示錯誤訊息「密碼必須包含英文字母和數字」

---

## [x] 【function 邏輯】密碼不含英文字母，應顯示「密碼必須包含英文字母和數字」
**範例輸入**：email = `"test@example.com"`, password = `"12345678"`，按下登入
**期待輸出**：顯示錯誤訊息「密碼必須包含英文字母和數字」

---

## [x] 【function 邏輯】Email 與密碼同時無效，應同時顯示兩個欄位的錯誤訊息
**範例輸入**：email = `"bad"`, password = `"123"`，按下登入
**期待輸出**：同時顯示 Email 錯誤與密碼錯誤訊息

---

## [x] 【Mock API】送出合法憑證時，應呼叫 `login()` 並導向 `/dashboard`
**範例輸入**：email = `"test@example.com"`, password = `"abc12345"`；mock `login()` resolve
**期待輸出**：`login()` 被呼叫一次，`navigate('/dashboard')` 被呼叫

---

## [x] 【Mock API】登入中 (isLoading) 時，輸入欄與按鈕應為 disabled 且顯示「登入中...」
**範例輸入**：email = `"test@example.com"`, password = `"abc12345"`；mock `login()` 為延遲 promise，按下登入
**期待輸出**：email/password input 有 `disabled` 屬性，按鈕文字顯示「登入中...」

---

## [x] 【Mock API】API 回傳錯誤（如 401），應顯示後端回傳的錯誤訊息
**範例輸入**：email = `"test@example.com"`, password = `"abc12345"`；mock `login()` reject，回傳 `{ message: "帳號或密碼錯誤" }`
**期待輸出**：`role="alert"` 橫幅顯示「帳號或密碼錯誤」

---

## [x] 【Mock API】API 無回傳訊息時，應顯示預設錯誤「登入失敗，請稍後再試」
**範例輸入**：email = `"test@example.com"`, password = `"abc12345"`；mock `login()` reject，無 response.data.message
**期待輸出**：`role="alert"` 橫幅顯示「登入失敗，請稍後再試」

---

## [x] 【驗證權限】已登入狀態下訪問登入頁，應自動導向 `/dashboard`
**範例輸入**：mock `useAuth()` 回傳 `isAuthenticated = true`
**期待輸出**：`navigate('/dashboard', { replace: true })` 被呼叫

---

## [x] 【驗證權限】`authExpiredMessage` 有值時，應顯示該訊息並清除
**範例輸入**：mock `useAuth()` 回傳 `authExpiredMessage = "登入已過期，請重新登入"`
**期待輸出**：`role="alert"` 橫幅顯示「登入已過期，請重新登入」，且 `clearAuthExpiredMessage()` 被呼叫
