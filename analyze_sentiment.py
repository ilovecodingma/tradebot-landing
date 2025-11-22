import json
import re
from collections import defaultdict

# JSON 파일 읽기
with open(r'C:\Users\user\Desktop\selleNeedsCluster\bitcoins_new1_titles_page_1_100.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 매매 의견 키워드
buy_keywords = [
    '사자', '매수', 'ㄱㄱ', '가즈아', '오른다', '오를', '상승', '떡상', '100%', '달', '불타는',
    '폭등', '급등', '시작', '출발', '가자', '탑승', '탄다', '올라', '뚫', '돌파', '갈',
    '찍', '각', '대박', '쌉', '개꿀', 'ㄱㄱㄱ', 'ㅆㅅㅌㅊ', '홀딩', '모으', '적립'
]

sell_keywords = [
    '팔아', '매도', '내리', '하락', '폭락', '손절', '빠져', '탈출', '나가', '도망',
    '떨어', '추락', '망', '끝', '죽', '물', '개박살', '쳐박', '박살', '망함', '버려',
    '던져', '청산', '물타기', '손실', '마이너스'
]

hold_keywords = [
    '관망', '지켜', '보류', '대기', '홀딩', '존버', '기다', '보고만'
]

# 감정 분석
sentiment_counts = {'매수': 0, '매도': 0, '관망': 0, '중립': 0}
total_posts = 0

# 코인별 매매 의견
coin_keywords = {
    'BTC': ['btc', '비트코인', '비트', '빗코'],
    'ETH': ['eth', '이더리움', '이더', '이디'],
    'XRP': ['xrp', '리플', '엑알피'],
}

coin_sentiment = {
    'BTC': {'매수': 0, '매도': 0, '관망': 0, '중립': 0},
    'ETH': {'매수': 0, '매도': 0, '관망': 0, '중립': 0},
    'XRP': {'매수': 0, '매도': 0, '관망': 0, '중립': 0}
}

for post in data:
    title = post.get('title', '').lower()
    article_id = post.get('article_id', '')

    # 광고, 공지, 설문 제외
    if article_id in ['AD', '공지', '설문']:
        continue

    total_posts += 1

    # 매매 의견 분류
    sentiment = '중립'
    if any(keyword in title for keyword in buy_keywords):
        sentiment = '매수'
    elif any(keyword in title for keyword in sell_keywords):
        sentiment = '매도'
    elif any(keyword in title for keyword in hold_keywords):
        sentiment = '관망'

    sentiment_counts[sentiment] += 1

    # 코인별 감정 분석
    for coin, keywords in coin_keywords.items():
        if any(keyword in title for keyword in keywords):
            coin_sentiment[coin][sentiment] += 1

# 전체 매매 의견 CSV 저장
with open(r'C:\Users\user\Desktop\tradebot-landing\src\data\trading-sentiment.csv', 'w', encoding='utf-8') as f:
    f.write('sentiment,count,percentage\n')
    for sentiment, count in sentiment_counts.items():
        percentage = (count / total_posts) * 100 if total_posts > 0 else 0
        f.write(f"{sentiment},{count},{round(percentage, 2)}\n")

# 코인별 매매 의견 CSV 저장
with open(r'C:\Users\user\Desktop\tradebot-landing\src\data\coin-trading-sentiment.csv', 'w', encoding='utf-8') as f:
    f.write('coin,sentiment,count,percentage\n')
    for coin, sentiments in coin_sentiment.items():
        total_coin_posts = sum(sentiments.values())
        if total_coin_posts > 0:
            for sentiment, count in sentiments.items():
                percentage = (count / total_coin_posts) * 100
                f.write(f"{coin},{sentiment},{count},{round(percentage, 2)}\n")

# 결과 출력
print(f"총 게시글 수: {total_posts}")
print(f"\n전체 매매 의견:")
for sentiment, count in sentiment_counts.items():
    percentage = (count / total_posts) * 100 if total_posts > 0 else 0
    print(f"{sentiment}: {count}회 ({percentage:.2f}%)")

print(f"\n코인별 매매 의견:")
for coin, sentiments in coin_sentiment.items():
    total_coin = sum(sentiments.values())
    if total_coin > 0:
        print(f"\n{coin} (총 {total_coin}개):")
        for sentiment, count in sentiments.items():
            percentage = (count / total_coin) * 100
            print(f"  {sentiment}: {count}회 ({percentage:.2f}%)")
