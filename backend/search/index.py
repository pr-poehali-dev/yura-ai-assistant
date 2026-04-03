"""
Поиск информации в интернете через DuckDuckGo и парсинг сниппетов.
Возвращает краткий ответ на вопрос пользователя.
"""
import json
import re
import urllib.request
import urllib.parse


def handler(event: dict, context) -> dict:
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    body = json.loads(event.get("body") or "{}")
    query = body.get("query", "").strip()

    if not query:
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "query required"})}

    result = search_ddg(query)

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({"answer": result, "query": query}, ensure_ascii=False),
    }


def search_ddg(query: str) -> str:
    # 1. Сначала пробуем DuckDuckGo Instant Answer API
    try:
        instant = ddg_instant(query)
        if instant:
            return instant
    except Exception:
        pass

    # 2. Парсим HTML-выдачу DuckDuckGo
    try:
        snippets = ddg_html(query)
        if snippets:
            return snippets
    except Exception:
        pass

    return "Не удалось найти информацию по этому запросу. Попробуй уточнить вопрос."


def ddg_instant(query: str) -> str:
    url = "https://api.duckduckgo.com/?q=" + urllib.parse.quote(query) + "&format=json&no_html=1&skip_disambig=1&kl=ru-ru"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    abstract = data.get("AbstractText", "").strip()
    if abstract and len(abstract) > 30:
        source = data.get("AbstractSource", "")
        return abstract[:600] + (f"\n\n📖 Источник: {source}" if source else "")

    answer = data.get("Answer", "").strip()
    if answer:
        return answer

    definition = data.get("Definition", "").strip()
    if definition:
        return definition[:400]

    return ""


def ddg_html(query: str) -> str:
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query) + "&kl=ru-ru"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0",
        "Accept-Language": "ru-RU,ru;q=0.9",
    })
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode("utf-8", errors="ignore")

    # Вытаскиваем сниппеты из результатов
    snippets = re.findall(r'class="result__snippet"[^>]*>(.*?)</a>', html, re.DOTALL)
    titles = re.findall(r'class="result__title"[^>]*>.*?<a[^>]*>(.*?)</a>', html, re.DOTALL)

    clean = []
    for s in snippets[:3]:
        text = re.sub(r"<[^>]+>", "", s).strip()
        text = re.sub(r"\s+", " ", text)
        if text and len(text) > 20:
            clean.append(text)

    if not clean:
        return ""

    result = " ".join(clean[:2])[:500]
    return result
