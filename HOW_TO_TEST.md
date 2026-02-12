# 🧪 Bag of Words - 測試指南

## 快速開始

### 前置檢查
```bash
cd /home/j/project/web
./test.sh
```

看到 `✅ All tests complete!` 表示後端運作正常。

---

## 方式 1️⃣：瀏覽器測試（推薦）

### 步驟
1. **打開瀏覽器**
   ```
   http://localhost:5173
   ```

2. **測試簡單查詢**
   
   在聊天框輸入：
   ```
   Show me total sales by category
   ```
   
   **預期結果**：
   - ✅ AI 說明如何查詢
   - ✅ 顯示 SQL 查詢框（可複製）
   - ✅ 顯示結果表格（2 行：Electronics, Furniture）

3. **測試更多查詢**

   **📊 基礎查詢**
   ```
   Show me all products
   List all customers
   What are the sales regions?
   ```

   **📈 聚合分析**
   ```
   Show top 5 products by sales
   What is the average order amount?
   Show sales by region
   ```

   **💡 複雜查詢**
   ```
   Show monthly sales for 2024
   Which customer has the highest lifetime value?
   Compare Electronics vs Furniture sales
   ```

4. **驗證功能**
   - [ ] AI 回應清晰易懂
   - [ ] SQL 查詢語法正確
   - [ ] 可以複製 SQL（點擊複製按鈕）
   - [ ] 表格顯示正確的欄位和資料
   - [ ] 錯誤訊息清晰（試試無效查詢）

---

## 方式 2️⃣：API 測試（開發者）

### 測試 Chat API
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show top 3 products by revenue"
  }' | python3 -m json.tool
```

**注意**：資料庫連線資訊由後端從 `.env` 檔案讀取（`DATABASE_URL`），前端不需要也不應該傳送資料庫憑證。

**預期回應**：
```json
{
  "response": "AI 說明...",
  "sql": "SELECT product_name, SUM(total_amount)...",
  "query_result": {
    "columns": ["product_name", "total_sales"],
    "rows": [...],
    "row_count": 3
  },
  "conversation_id": "...",
  "metadata": {
    "has_schema": true
  }
}
```

### 測試 Schema Introspection
```bash
curl -X POST http://localhost:8000/api/data-sources/schema \
  -H "Content-Type: application/json" \
  -d '{"database_url":"postgresql://testuser:testpass@localhost:5433/bagofwords"}' \
  | python3 -m json.tool | head -50
```

**預期結果**：顯示 3 個表（sales, customers, products）的完整 schema

### 測試 SQL 執行
```bash
curl -X POST http://localhost:8000/api/data-sources/execute \
  -H "Content-Type: application/json" \
  -d '{
    "database_url": "postgresql://testuser:testpass@localhost:5433/bagofwords",
    "sql": "SELECT category, COUNT(*) as count FROM sales GROUP BY category"
  }' | python3 -m json.tool
```

---

## 方式 3️⃣：直接查看資料庫

### 連接到測試資料庫
```bash
PGPASSWORD=testpass psql -h localhost -p 5433 -U testuser -d bagofwords
```

### 查看資料
```sql
-- 查看所有表
\dt

-- 查看 sales 表結構
\d sales

-- 查看範例資料
SELECT * FROM sales LIMIT 5;

-- 統計資料
SELECT 
  category,
  COUNT(*) as order_count,
  SUM(total_amount) as total_sales
FROM sales 
GROUP BY category;

-- 離開
\q
```

---

## 🎯 測試檢查清單

### 基礎功能
- [ ] ✅ 前端載入正常（http://localhost:5173）
- [ ] ✅ 後端 API 正常（http://localhost:8000/health）
- [ ] ✅ 資料庫連接正常
- [ ] ✅ 可以發送訊息
- [ ] ✅ AI 有回應

### 核心功能
- [ ] ✅ AI 能理解自然語言問題
- [ ] ✅ 生成的 SQL 語法正確
- [ ] ✅ SQL 能成功執行
- [ ] ✅ 結果正確顯示在表格中
- [ ] ✅ 可以複製 SQL 查詢

### 錯誤處理
- [ ] ✅ 無效 SQL 有錯誤提示
- [ ] ✅ 資料庫連接失敗有提示
- [ ] ✅ 網路錯誤有提示

---

## 📊 測試資料說明

### Sales 表（15 筆）
- 時間範圍：2024-01-15 到 2024-06-15
- 分類：Electronics (10 筆), Furniture (5 筆)
- 地區：North, South, East, West

### Customers 表（5 筆）
- 客戶名稱、Email、地區
- 總訂單數、終身價值

### Products 表（10 筆）
- 產品名稱、分類、價格
- 庫存數量、供應商

---

## 🐛 常見問題

### Q: 前端顯示 "Failed to send message"
A: 檢查後端是否運行：`curl http://localhost:8000/health`

### Q: SQL 沒有執行
A: 確認後端 `.env` 檔案中 `DATABASE_URL` 已正確設定

### Q: 資料庫連接失敗
A: 確認 Docker 容器運行：`docker ps | grep bagofwords-db`

### Q: 想要重新載入測試資料
```bash
PGPASSWORD=testpass psql -h localhost -p 5433 -U testuser -d bagofwords -f /tmp/test_data.sql
```

---

## 🚀 下一步

測試完成後，你可以：
1. 嘗試更複雜的查詢
2. 檢查生成的 SQL 是否最佳化
3. 測試邊界情況（空結果、大量資料）
4. 提供反饋來改進 AI 提示詞

---

**Happy Testing! 🎉**
