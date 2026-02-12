from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionMessageParam
import os
from typing import Optional, Dict


class LLMService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.client = AsyncOpenAI(api_key=api_key) if api_key else None
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    async def generate_response(
        self, message: str, conversation_id: str, schema_context: Optional[Dict] = None
    ) -> tuple[str, Optional[Dict]]:
        if not self.client:
            return (
                f"[DEMO MODE] You asked: {message}\n\nThis is a demo response. Please set OPENAI_API_KEY in your .env file to enable real AI responses.",
                None,
            )

        try:
            system_prompt = """You are an AI data analyst assistant. 
You help users analyze their data by:
1. Understanding natural language questions about data
2. Generating SQL queries when needed
3. Explaining results clearly
4. Suggesting visualizations

When generating SQL, wrap it in ```sql``` code blocks.

IMPORTANT: After providing the SQL query, you MUST suggest a visualization by adding a JSON block.

Visualization guidelines - Choose the best chart type for the data:

**Table**: detailed data inspection, mixed data types, small datasets
**Bar Chart**: category comparisons, rankings, distribution across categories
**Horizontal Bar**: same as bar but better when category names are long
**Stacked Bar**: showing composition of categories, part-to-whole relationships
**Line Chart**: time series data, trends over time, continuous data
**Area Chart**: similar to line but emphasizes volume/magnitude over time
**Pie Chart**: proportions and percentages, market share (max 7-8 categories)
**Donut Chart**: modern alternative to pie chart with better aesthetics
**Scatter Plot**: correlation between two numeric variables, distribution patterns
**Combo Chart**: comparing different scales (e.g., revenue bars + growth rate line)

REQUIRED FORMAT - Always include this block after your explanation:
```visualization
{
  "type": "bar",
  "xKey": "category",
  "yKeys": ["total_sales"],
  "title": "Sales by Category"
}
```

Valid chart types: "table", "bar", "horizontalBar", "stackedBar", "line", "area", "pie", "donut", "scatter", "combo"

Examples:

Time series:
```visualization
{
  "type": "line",
  "xKey": "date",
  "yKeys": ["revenue", "cost"],
  "title": "Revenue vs Cost Over Time"
}
```

Proportions:
```visualization
{
  "type": "pie",
  "xKey": "category",
  "yKeys": ["market_share"],
  "title": "Market Share by Category"
}
```

Correlation:
```visualization
{
  "type": "scatter",
  "xKey": "price",
  "yKeys": ["sales_volume"],
  "title": "Price vs Sales Volume"
}
```

Stacked comparison:
```visualization
{
  "type": "stackedBar",
  "xKey": "quarter",
  "yKeys": ["product_a", "product_b", "product_c"],
  "title": "Quarterly Sales by Product"
}
```

Combo chart:
```visualization
{
  "type": "combo",
  "xKey": "month",
  "yKeys": ["revenue", "profit"],
  "barKeys": ["revenue"],
  "lineKeys": ["profit"],
  "title": "Revenue (Bar) vs Profit Margin (Line)"
}
```

Be concise but thorough. Always ask for clarification if the question is ambiguous."""

            if schema_context:
                schema_info = "\n\nAvailable database schema:\n"
                for table, columns in schema_context.items():
                    schema_info += f"\nTable: {table}\n"
                    for col in columns:
                        schema_info += f"  - {col['name']} ({col['type']}){' NOT NULL' if not col['nullable'] else ''}\n"
                system_prompt += schema_info

            messages: list[ChatCompletionMessageParam] = [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": "Show me top products by revenue",
                },
                {
                    "role": "assistant",
                    "content": """I'll help you find the top products by revenue.

```sql
SELECT product_name, SUM(total_amount) AS revenue
FROM sales
GROUP BY product_name
ORDER BY revenue DESC
LIMIT 10;
```

```visualization
{
  "type": "bar",
  "xKey": "product_name",
  "yKeys": ["revenue"],
  "title": "Top Products by Revenue"
}
```""",
                },
                {"role": "user", "content": message},
            ]

            response = await self.client.chat.completions.create(
                model=self.model, messages=messages, max_completion_tokens=1000
            )

            response_text = (
                response.choices[0].message.content or "I couldn't generate a response."
            )

            visualization_config = self._extract_visualization_config(response_text)

            return (response_text, visualization_config)

        except Exception as e:
            raise Exception(f"LLM generation failed: {str(e)}")

    def _extract_visualization_config(self, text: str) -> Optional[Dict]:
        import re
        import json

        viz_pattern = r"```visualization\s*(.*?)\s*```"
        match = re.search(viz_pattern, text, re.DOTALL | re.IGNORECASE)

        if match:
            try:
                viz_json = match.group(1).strip()
                return json.loads(viz_json)
            except json.JSONDecodeError:
                return None

        return None
