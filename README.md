## Proje Özellikleri

### Oyun Mekanikleri

-   Klasik "Simon Says" oyununa modern dokunuşlar
-   3 farklı zorluk seviyesi: Kolay, Orta, Zor
-   Dinamik puanlama sistemi ve çarpanlar
-   Seri takibi (streak) ve yüksek skor kaydı
-   Gerçek zamanlı liderlik tablosu (zorluk seviyesine göre filtrelenebilir)

### Kişiselleştirme

-   Renk seçici ile özel tema oluşturma
-   Kare, daire, altıgen gibi farklı şekiller
-   Birden fazla temayı kaydetme ve yönetme
-   Varsayılan sistem teması

### Kontrol ve Erişilebilirlik

-   Fare, dokunmatik ve isteğe bağlı klavye (1-9 arası tuşlar) ile kontrol
-   Mobil cihazlarda titreşim geri bildirimi
-   Otomatik yakınlaştırma (mobil kullanıcı deneyimi için)
-   Karanlık ve aydınlık mod desteği

### Ses Sistemi

-   Opsiyonel ses efektleri (doğru/yanlış tıklama)
-   Başarı elde etme sesleri

### Kullanıcı Özellikleri

-   E-posta ile kullanıcı girişi ve kaydı
-   Kişisel profil ve istatistik ekranı
-   Kazanımlar (Achievements)
-   Kayıtlı kullanıcı ayarları (tema, kontrol, ses)

## Kullanılan Teknolojiler

### Frontend

-   React 18
-   TypeScript
-   Tailwind CSS
-   Vite
-   Lucide React (ikonlar)
-   Web Audio API (dinamik ses üretimi)

### Backend

-   Supabase (PostgreSQL tabanlı)
-   Row-Level Security (kullanıcı bazlı erişim)
-   Gerçek zamanlı veri güncellemeleri
-   Edge Functions (fonksiyon yönetimi)

### Durum Yönetimi

-   React Context API
-   Özel Hook'lar:
    -   Kullanıcı doğrulama (auth)
    -   Oyun durumu
    -   Tema yönetimi
    -   Ses kontrolü
    -   Giriş yönetimi

## Dosya Yapısı

```
├── src/
│   ├── components/
│   │   ├── auth/         # Kimlik doğrulama bileşenleri
│   │   ├── game/         # Oyuna özgü bileşenler
│   │   ├── layout/       # Düzen bileşenleri
│   │   ├── settings/     # Ayarlar bileşenleri
│   │   └── ui/          # Yeniden kullanılabilir UI bileşenleri
│   ├── contexts/
│   │   ├── AuthContext.tsx       # Kimlik doğrulama durumu
│   │   ├── ColorThemeContext.tsx # Karanlık/Aydınlık mod
│   │   ├── ControlsContext.tsx   # Giriş işleme
│   │   ├── GameContext.tsx       # Oyun durumu
│   │   ├── SoundContext.tsx      # Ses yönetimi
│   │   └── ThemeContext.tsx      # Tema yönetimi
│   ├── lib/
│   │   └── supabase.ts   # Supabase istemci yapılandırması
│   └── pages/            # Sayfa bileşenleri
└── public/              # Statik varlıklar
```

## Veritabanı Yapısı

### Tablolar:

-   users: Kullanıcı bilgileri
-   themes: Oluşturulan özel temalar
-   games: Oyun kayıtları
-   high_scores: En yüksek puanlar
-   achievements: Kazanılan başarımlar
-   settings: Kullanıcı ayarları

### Güvenlik & Özellikler:

-   Her tabloda kullanıcı bazlı veri erişim kontrolü (RLS)
-   Dış anahtar (foreign key) ilişkileri
-   Varsayılan değerler
-   Benzersiz alan kontrolleri
-   Otomatik zaman damgası (timestamp)

## Oyun Kuralları

1. Ekranda yanan ışık dizisini dikkatle izleyin.
2. Aynı sırayla doğru tuşlara basarak diziyi tekrar edin.
3. Her başarılı tur:
    - Diziyi bir adım uzatır
    - Skorunuzu artırır (zorluk ve uzunluğa göre)
    - Seri puanınızı günceller

## Zorluklar

-   Kolay: Yavaş hız, uzun bekleme – 1x puan
-   Orta: Orta hız – 2x puan
-   Zor: Hızlı sıra, kısa bekleme – 3x puan

## Skor Çarpanları

-   Zorluk bazlı çarpan: 1x – 3x
-   Dizi uzunluğuna göre ekstra çarpan:
    -   5+ tuş: 2x
    -   10+ tuş: 3x
    -   13+ tuş: 4x
    -   16+ tuş: 5x
    -   20+ tuş: 6x

## Başarımlar (Achievements)

-   Sharp Starter: Tek oyunda 5 puan
-   Memory Master: Tek oyunda 10 puan
-   Reflex Lord: Tek oyunda 15 puan
-   Simon Slayer: Tek oyunda 20 puan

## Kurulum Talimatları

Bu proje ZIP dosyası olarak teslim edilecektir. Aşağıdaki adımları izleyerek yerel makinenizde çalıştırabilirsiniz:

1. ZIP dosyasını çıkarın.
2. Bilgisayarınızda Node.js kurulu olduğundan emin olun.
3. Proje klasöründe terminal açarak bağımlılıkları yükleyin:

```
npm install
```

4. Ortam değişkenlerini tanımlayın. Proje kök klasöründe .env adında bir dosya oluşturun ve aşağıdaki örneği doldurun:

```
VITE_SUPABASE_URL=Supabase projenizin URL'si
VITE_SUPABASE_ANON_KEY=Anonim API anahtarı
```

5. Geliştirme sunucusunu başlatın:

```
npm run dev
```

6. Proje http://localhost:5173 adresinde çalışacaktır.

Herhangi bir sorunuz olursa detaylar kod yorumlarında ve bileşen açıklamalarında mevcuttur. Oyun mobil cihazlarda da test edilmiştir.

## Veritabanı Yapılandırması (SQL Script)

Aşağıda, Supabase üzerinde kurulan veritabanı şemasına ait tam SQL betiği yer almaktadır. Bu yapı; kullanıcı yönetimi, tema ayarları, oyun verileri, istatistikler ve kullanıcı tercihleri gibi tüm sistemleri kapsamaktadır.

### Tabloların Oluşturulması

```sql
-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- THEMES TABLE
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  colors TEXT[] NOT NULL,
  tile_shape TEXT NOT NULL DEFAULT 'square',
  system_theme BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GAMES TABLE
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL,
  streak INTEGER NOT NULL DEFAULT 0,
  theme_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HIGH SCORES
CREATE TABLE high_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, difficulty)
);

-- ACHIEVEMENTS
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- SETTINGS
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);
```

### Kullanıcı Tetikleyicileri (Triggers)

```sql
-- Yeni kullanıcı eklenince tetiklenir
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  default_username TEXT;
BEGIN
  default_username := split_part(NEW.email, '@', 1);
  WHILE EXISTS (SELECT 1 FROM users WHERE username = default_username) LOOP
    default_username := default_username || floor(random() * 1000)::text;
  END LOOP;
  INSERT INTO public.users (id, email, username, created_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', default_username), NOW());
  RETURN NEW;
END;
$$;

-- Kullanıcı güncellendiğinde tetiklenir
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users
  SET email = COALESCE(NEW.email, users.email),
      username = COALESCE(NEW.raw_user_meta_data->>'username', users.username),
      updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Trigger tanımlamaları
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
```

### RLS Politikaları (Row Level Security)

```sql
-- RLS aktif hale getiriliyor
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Select own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Update own data" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- THEME POLICIES
CREATE POLICY "Own themes" ON themes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- GAME POLICIES
CREATE POLICY "Own games" ON games
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SETTINGS POLICIES
CREATE POLICY "Own settings" ON settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ACHIEVEMENT POLICIES
CREATE POLICY "Own achievements" ON achievements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- HIGH SCORE POLICIES
CREATE POLICY "All can view" ON high_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own insert/update" ON high_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update" ON high_scores FOR UPDATE TO authenticated USING (auth.uid() = user_id);
```
