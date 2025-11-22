import json
import re
from collections import defaultdict

# JSON 파일 읽기
with open(r'C:\Users\user\Desktop\selleNeedsCluster\bitcoins_new1_titles_page_1_100.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 코인 키워드 매핑 (대소문자 구분 없이)
coin_keywords = {
    'BTC': ['btc', '비트코인', '비트', '빗코'],
    'ETH': ['eth', '이더리움', '이더', '이디'],
    'XRP': ['xrp', '리플', '엑알피'],
    'DASH': ['dash', '대시', '다시'],
    'SWELL': ['swell', '스웰'],
    'PORTA': ['porta', '포르타', '포타'],
    'SOL': ['sol', '솔라나', 'solana'],
    'ADA': ['ada', '에이다', '카르다노'],
    'DOGE': ['doge', '도지', '도지코인'],
    'MATIC': ['matic', '매틱', '폴리곤'],
    'DOT': ['dot', '도트', '폴카닷'],
    'AVAX': ['avax', '아발란체', '아박스'],
    'LINK': ['link', '링크', '체인링크'],
    'UNI': ['uni', '유니스왑', '유니'],
    'ATOM': ['atom', '아톰', '코스모스']
}

# 코인별 언급 횟수 카운트
coin_counts = defaultdict(int)
total_posts = 0

for post in data:
    title = post.get('title', '').lower()
    article_id = post.get('article_id', '')

    # 광고, 공지, 설문 제외
    if article_id in ['AD', '공지', '설문']:
        continue

    total_posts += 1

    # 각 코인 키워드 검색
    for coin, keywords in coin_keywords.items():
        for keyword in keywords:
            if keyword in title:
                coin_counts[coin] += 1
                break  # 중복 카운트 방지

# 결과를 CSV 형식으로 저장
output_data = []
for coin, count in sorted(coin_counts.items(), key=lambda x: x[1], reverse=True):
    percentage = (count / total_posts) * 100 if total_posts > 0 else 0
    output_data.append({
        'coin': coin,
        'mentions': count,
        'percentage': round(percentage, 2)
    })

# CSV 파일로 저장
with open(r'C:\Users\user\Desktop\tradebot-landing\src\data\community-sentiment-data.csv', 'w', encoding='utf-8') as f:
    f.write('coin,mentions,percentage\n')
    for item in output_data:
        f.write(f"{item['coin']},{item['mentions']},{item['percentage']}\n")

# 결과 출력
print(f"총 게시글 수 (광고/공지 제외): {total_posts}")
print(f"\n코인별 언급 횟수:")
for item in output_data:
    print(f"{item['coin']}: {item['mentions']}회 ({item['percentage']}%)")
