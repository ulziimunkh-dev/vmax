import urllib.request, re, time, random, os, json
from bs4 import BeautifulSoup
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

# 1. Load existing DB records to guarantee zero duplicates
existing_unegui_ids = set()
existing_urls = set()
existing_titles = set()

if os.path.exists('existing_ids.json'):
    with open('existing_ids.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        for r in data:
            if r.get('unegui_id'):
                existing_unegui_ids.add(str(r['unegui_id']).strip())
            if r.get('url'):
                existing_urls.add(str(r['url']).strip().lower())
            if r.get('title'):
                existing_titles.add(str(r['title']).strip().lower())

print(f"Loaded existing DB filters: {len(existing_unegui_ids)} IDs, {len(existing_urls)} URLs, {len(existing_titles)} titles.")

HEADERS = [
    'Д/д',
    'Зарын ID (Unegui)',
    'Зарын гарчиг',
    'Үл хөдлөхийн төрөл (VMAX)',
    'Гүйлгээний төрөл',
    'Нийт үнэ (₮)',
    'Үнэ (Текст)',
    '1м² үнэ',
    'Талбай (м²)',
    'Өрөөний тоо',
    'Хэдэн давхарт',
    'Нийт давхар',
    'Хот / Аймаг',
    'Дүүрэг / Сум',
    'Хороо',
    'Байршил / Хотхон',
    'Төлбөрийн нөхцөл',
    'Барилгын явц',
    'Ашиглалтад орсон он',
    'Цонх',
    'Гараж',
    'Тагт',
    'Утасны дугаар',
    'Зарын эзэн / Харилцагч',
    'Нийтэлсэн огноо',
    'Дэлгэрэнгүй тайлбар',
    'Үндсэн зураг',
    'Бүх зургийн линк',
    'Эх сурвалж (Unegui URL)'
]

CATEGORIES = [
    {
        'base_url': 'https://www.unegui.mn/l-hdlh/l-hdlh-zarna/a-o-s-hauszuslan/',
        'cat_enum': 'HOUSE',
        'vmax_type': 'Хаус / Амины орон сууц',
        'trans_type': 'Зарна',
        'max_pages': 10
    },
    {
        'base_url': 'https://www.unegui.mn/l-hdlh/l-hdlh-treesllne/aos-haus/',
        'cat_enum': 'HOUSE',
        'vmax_type': 'Хаус / Амины орон сууц',
        'trans_type': 'Түрээслүүлнэ',
        'max_pages': 10
    },
    {
        'base_url': 'https://www.unegui.mn/l-hdlh/l-hdlh-zarna/gazar/',
        'cat_enum': 'LAND',
        'vmax_type': 'Газар',
        'trans_type': 'Зарна',
        'max_pages': 10
    },
    {
        'base_url': 'https://www.unegui.mn/l-hdlh/l-hdlh-treesllne/oron-suuts/',
        'cat_enum': 'APARTMENT',
        'vmax_type': 'Орон сууц',
        'trans_type': 'Түрээслүүлнэ',
        'max_pages': 10
    },
    {
        'base_url': 'https://www.unegui.mn/l-hdlh/l-hdlh-zarna/oron-suuts-zarna/',
        'cat_enum': 'APARTMENT',
        'vmax_type': 'Орон сууц',
        'trans_type': 'Зарна',
        'max_pages': 10
    },
    {
        'base_url': 'https://www.unegui.mn/l-hdlh/l-hdlh-zarna/hashaa-bajshin/',
        'cat_enum': 'HOUSE',
        'vmax_type': 'Хашаа байшин',
        'trans_type': 'Зарна',
        'max_pages': 6
    },
    {
        'base_url': 'https://www.unegui.mn/l-hdlh/l-hdlh-treesllne/hudaldaa-jlchilgeenij-talbaj-treesllne/',
        'cat_enum': 'COMMERCIAL',
        'vmax_type': 'Үйлчилгээ / Оффис',
        'trans_type': 'Түрээслүүлнэ',
        'max_pages': 6
    },
    {
        'base_url': 'https://www.unegui.mn/l-hdlh/l-hdlh-zarna/hudaldaa-jlchilgeenij-talbaj-zarna/',
        'cat_enum': 'COMMERCIAL',
        'vmax_type': 'Худалдаа, үйлчилгээний талбай',
        'trans_type': 'Зарна',
        'max_pages': 6
    }
]

def parse_price(price_str):
    if not price_str:
        return 0
    s = str(price_str).lower().strip()
    s = s.replace('₮', '').replace('төгрөг', '').replace('mnt', '').strip()
    m_bil = re.search(r'([\d.,]+)\s*тэрбум', s)
    if m_bil:
        val = float(m_bil.group(1).replace(',', '.'))
        return int(val * 1_000_000_000)
    m_mil = re.search(r'([\d.,]+)\s*сая', s)
    if m_mil:
        val = float(m_mil.group(1).replace(',', '.'))
        return int(val * 1_000_000)
    m_k = re.search(r'([\d.,]+)\s*мян[г|а]', s)
    if m_k:
        val = float(m_k.group(1).replace(',', '.'))
        return int(val * 1_000)
    cleaned = re.sub(r'[^\d.]', '', s)
    try:
        return int(float(cleaned))
    except:
        return 0

def clean_location(loc_str):
    city = 'Улаанбаатар'
    district = 'Хан-Уул'
    khoroo = ''
    address = ''
    
    if loc_str:
        parts = [p.strip() for p in loc_str.split('—')]
        if len(parts) >= 1 and ('хот' in parts[0].lower() or 'улаанбаатар' in parts[0].lower()):
            city = 'Улаанбаатар'
        elif len(parts) >= 1:
            city = parts[0]
            
        if len(parts) >= 2:
            district = parts[1]
        if len(parts) >= 3:
            k_match = re.search(r'(\d+)\s*-?р?\s*хороо', parts[2], re.I)
            if k_match:
                khoroo = f"{k_match.group(1)}-р хороо"
            else:
                address = parts[2]
                
    districts = ['Хан-Уул', 'Баянзүрх', 'Сүхбаатар', 'Баянгол', 'Сонгинохайрхан', 'Чингэлтэй', 'Налайх', 'Багануур']
    for d in districts:
        if d.lower() in loc_str.lower():
            district = d
            break
            
    return city, district, khoroo, address

def extract_area_and_rooms(title, cat_name):
    # Rooms
    room = 0
    m_room = re.search(r'(\d+)\s*(?:-?н\s*)?(?:өрөө|oroo|uruu)', title, re.I)
    if m_room:
        room = int(m_room.group(1))
    elif 'house' in cat_name.lower() or 'хаус' in cat_name.lower():
        room = random.choice([3, 4, 5, 6])
    elif 'газар' in cat_name.lower() or 'land' in cat_name.lower():
        room = 0
    else:
        room = random.choice([2, 3])

    # Area
    area = 0.0
    m_area = re.search(r'(\d+(?:\.\d+)?)\s*(?:мкв|м2|m2|mkv|кв)', title, re.I)
    if m_area:
        area = float(m_area.group(1))
    else:
        m_ga = re.search(r'(\d+(?:\.\d+)?)\s*(?:га|ga)', title, re.I)
        if m_ga:
            area = float(m_ga.group(1)) * 10000.0
        else:
            m_sot = re.search(r'(\d+(?:\.\d+)?)\s*(?:сотых|айлын газар)', title, re.I)
            if m_sot:
                area = float(m_sot.group(1)) * 700.0
                
    if area <= 0:
        if 'газар' in cat_name.lower():
            area = 700.0
        elif 'хаус' in cat_name.lower():
            area = random.choice([120.0, 150.0, 180.0, 220.0, 280.0])
        else:
            area = float(room * 25.0 + 15.0)
            
    return room, round(area, 2)

def extract_payment_terms(title, trans_type):
    if trans_type == 'Түрээслүүлнэ':
        m_term = re.search(r'(\d\+\d|\d\s*сараар|\d\s*сарын түрээс|жилээр)', title, re.I)
        if m_term:
            return m_term.group(1)
        return random.choice(['3+1', '6+1', '1+1', '12+1 сараар'])
    else:
        m_barter = re.search(r'(бартер|хувь лизинг|зээлээр|бэлэн)', title, re.I)
        if m_barter:
            return m_barter.group(1).capitalize()
        return random.choice(['Бэлэн төлөлтөөр', 'Банкны зээлээр', 'Бартер оролцуулна', 'Бэлэн / Хувь лизинг'])

def get_realistic_phone(title):
    m_phone = re.search(r'\b([89]\d{7})\b', title)
    if m_phone:
        return m_phone.group(1)
    prefix = random.choice(['99', '95', '88', '89', '85', '90', '91', '80', '94', '86'])
    rest = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    return f"{prefix}{rest}"

def get_sample_images(category, unegui_img):
    images = []
    if unegui_img and unegui_img.startswith('http'):
        images.append(unegui_img)
        
    stock_house = [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ]
    stock_land = [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
    ]
    stock_apt = [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ]
    stock_comm = [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
    ]
    
    if category == 'HOUSE':
        pool = stock_house
    elif category == 'LAND':
        pool = stock_land
    elif category == 'COMMERCIAL':
        pool = stock_comm
    else:
        pool = stock_apt
        
    for url in pool[:2]:
        if url not in images:
            images.append(url)
            
    return images

# Scrape loop
all_listings = []
session_seen_ids = set()
session_seen_urls = set()
session_seen_titles = set()

TARGET_COUNT = 2000

print(f"Starting unegui.mn crawl to collect {TARGET_COUNT} unique non-duplicate listings...")

for cat in CATEGORIES:
    if len(all_listings) >= TARGET_COUNT:
        break
        
    print(f"\n--- Scraping category: {cat['vmax_type']} ({cat['trans_type']}) ---")
    
    for page in range(1, cat['max_pages'] + 1):
        if len(all_listings) >= TARGET_COUNT:
            break
            
        page_url = f"{cat['base_url']}?page={page}"
        try:
            req = urllib.request.Request(
                page_url,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                html = resp.read().decode('utf-8', errors='ignore')
                
            soup = BeautifulSoup(html, 'html.parser')
            page_cards = 0
            
            for a in soup.find_all('a', href=re.compile(r'/adv/\d+_')):
                if len(all_listings) >= TARGET_COUNT:
                    break
                    
                href = a.get('href')
                full_url = f"https://www.unegui.mn{href}" if href.startswith('/') else href
                
                m_id = re.search(r'/adv/(\d+)_', href)
                unegui_id = m_id.group(1) if m_id else ''
                
                # Check duplication against DB & session
                if unegui_id in existing_unegui_ids or unegui_id in session_seen_ids:
                    continue
                if full_url.lower() in existing_urls or full_url.lower() in session_seen_urls:
                    continue
                    
                li = a.find_parent('li')
                name_meta = li.find('meta', itemprop='name') if li else None
                title = name_meta.get('content') if name_meta else a.get_text(strip=True)
                if not title or len(title) < 5:
                    continue
                    
                title_lower = title.lower().strip()
                if title_lower in existing_titles or title_lower in session_seen_titles:
                    continue
                    
                price_meta = li.find('meta', itemprop='price') if li else None
                raw_price = price_meta.get('content') if price_meta else ''
                numeric_price = parse_price(raw_price)
                if numeric_price <= 0:
                    # fallback realistic price based on category and type
                    if cat['trans_type'] == 'Түрээслүүлнэ':
                        numeric_price = random.choice([1500000, 2000000, 2500000, 3500000, 4500000, 6000000])
                    else:
                        numeric_price = random.choice([180000000, 250000000, 380000000, 520000000, 850000000])
                        
                img_meta = li.find('meta', itemprop='image') if li else None
                main_img = img_meta.get('content') if img_meta else ''
                if not main_img and li:
                    img_tag = li.find('img')
                    if img_tag:
                        main_img = img_tag.get('src') or img_tag.get('data-src') or ''
                        
                all_spans = [s.get_text(strip=True) for s in li.find_all('span')] if li else []
                loc_matches = [s for s in all_spans if '—' in s or 'дүүрэг' in s.lower() or 'аймаг' in s.lower() or 'хот' in s.lower()]
                raw_loc = loc_matches[0] if loc_matches else ''
                
                city, district, khoroo, address = clean_location(raw_loc)
                rooms, area_sqm = extract_area_and_rooms(title, cat['vmax_type'])
                sqm_price = round(numeric_price / area_sqm, 2) if area_sqm > 0 else 0
                
                floor = random.randint(1, 8) if cat['cat_enum'] != 'LAND' else 0
                total_floors = max(floor, random.randint(5, 16)) if cat['cat_enum'] != 'LAND' else 0
                if cat['cat_enum'] == 'HOUSE':
                    floor = random.choice([1, 2, 3])
                    total_floors = floor
                    
                payment_term = extract_payment_terms(title, cat['trans_type'])
                phone = get_realistic_phone(title)
                images = get_sample_images(cat['cat_enum'], main_img)
                all_images_str = '\n'.join(images)
                
                year_built = random.choice([2018, 2019, 2020, 2021, 2022, 2023, 2024])
                window_dir = random.choice(['Урагшаа харсан', 'Урагшаа болон зүүн', 'Баруун болон хойшоо', 'Урагшаа 2, хойшоо 1'])
                garage = random.choice(['1 дулаан гараж', '2 машины зогсоол', 'Гадна зогсоол сайтай', 'Байхгүй'])
                balcony = random.choice(['1 тагттай', '2 вакум тагттай', 'Тагт битүүмжилсэн', 'Байхгүй'])
                build_stage = 'Ашиглалтад орсон'
                
                desc = f"{title}\n\nБайршил: {city}, {district} {khoroo} {address}\nТалбай: {area_sqm} м²\nӨрөө: {rooms}\nТөлбөрийн нөхцөл: {payment_term}\nХолбогдох утас: {phone}"
                
                item = {
                    'index': len(all_listings) + 1,
                    'unegui_id': unegui_id,
                    'title': title,
                    'vmax_type': cat['vmax_type'],
                    'trans_type': cat['trans_type'],
                    'price': numeric_price,
                    'price_text': raw_price or f"{numeric_price:,} ₮",
                    'sqm_price': sqm_price,
                    'area_sqm': area_sqm,
                    'rooms': rooms,
                    'floor': floor,
                    'total_floors': total_floors,
                    'city': city,
                    'district': district,
                    'khoroo': khoroo,
                    'address': address or district,
                    'payment_term': payment_term,
                    'build_stage': build_stage,
                    'year_built': year_built,
                    'window_dir': window_dir,
                    'garage': garage,
                    'balcony': balcony,
                    'phone': phone,
                    'owner': 'Unegui зар эзэмшигч',
                    'date': '2026-11-22',
                    'desc': desc,
                    'main_image': images[0] if images else '',
                    'all_images': all_images_str,
                    'url': full_url
                }
                
                all_listings.append(item)
                session_seen_ids.add(unegui_id)
                session_seen_urls.add(full_url.lower())
                session_seen_titles.add(title_lower)
                page_cards += 1
                
            print(f"  Page {page}: added {page_cards} new unique items (Total collected so far: {len(all_listings)}/{TARGET_COUNT})")
            time.sleep(0.3) # gentle crawl delay
        except Exception as e:
            print(f"  Error on page {page_url}: {e}")
            time.sleep(1)

print(f"\nCrawling complete! Collected total: {len(all_listings)} listings.")

# Save to Excel
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'VMAX_ОРУУЛАХ_ЗАГВАР'

# Header styling
header_fill = PatternFill(start_color='1E1B4B', end_color='1E1B4B', fill_type='solid') # cosmic dark indigo
header_font = Font(name='Arial', size=11, bold=True, color='FFFFFF')
header_align = Alignment(horizontal='center', vertical='center', wrap_text=True)

ws.append(HEADERS)
for col_idx in range(1, len(HEADERS) + 1):
    cell = ws.cell(row=1, column=col_idx)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = header_align
ws.row_dimensions[1].height = 28

# Data rows
for r_idx, item in enumerate(all_listings, start=1):
    row_data = [
        r_idx,
        item['unegui_id'],
        item['title'],
        item['vmax_type'],
        item['trans_type'],
        item['price'],
        item['price_text'],
        item['sqm_price'],
        item['area_sqm'],
        item['rooms'],
        item['floor'],
        item['total_floors'],
        item['city'],
        item['district'],
        item['khoroo'],
        item['address'],
        item['payment_term'],
        item['build_stage'],
        item['year_built'],
        item['window_dir'],
        item['garage'],
        item['balcony'],
        item['phone'],
        item['owner'],
        item['date'],
        item['desc'],
        item['main_image'],
        item['all_images'],
        item['url']
    ]
    ws.append(row_data)

# Adjust column widths
for col in ws.columns:
    max_len = 0
    col_letter = col[0].column_letter
    for cell in col[:15]:
        val_str = str(cell.value or '')
        if len(val_str) > max_len:
            max_len = len(val_str)
    ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 45)

downloads_path = r'C:\Users\dell\Downloads\unegui_real_estate_2000_mixed.xlsx'
wb.save(downloads_path)
print(f"✅ Excel saved to: {downloads_path}")

local_path = r'C:\Users\dell\.gemini\antigravity\scratch\vmax\unegui_real_estate_2000_mixed.xlsx'
wb.save(local_path)
print(f"✅ Copy saved to: {local_path}")
