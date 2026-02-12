#!/bin/bash

echo "🧪 Testing Bag of Words API..."
echo ""

echo "1️⃣ Health check..."
curl -s http://localhost:8000/health | python3 -m json.tool
echo ""

echo "2️⃣ Chat without database..."
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is 2+2?"}' | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'Response: {data[\"response\"][:80]}...')"
echo ""

echo "3️⃣ Chat with database (SQL generation + execution)..."
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me total sales by category"}' | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'✅ AI Response: {data[\"response\"][:80]}...')
if data.get('sql'):
    print(f'✅ SQL Generated: {data[\"sql\"][:50]}...')
if data.get('query_result'):
    print(f'✅ Query Executed: {data[\"query_result\"][\"row_count\"]} rows returned')
    print(f'   Columns: {data[\"query_result\"][\"columns\"]}')
"
echo ""

echo "✅ All tests complete!"
