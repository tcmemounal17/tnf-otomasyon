# TNF canlı RSS çalıştırıcısı

Her 15 dakikada (07/22/37/52) bir kontrol; GitHub zamanlaması gecikebilir.
Kullanıcının TNF sitesinde başlatması gerekir. Durdurulmuş sistem paylaşım yapmaz.
RSS ve tasarım ayarları özel TNF sitesinden alınır; bu depoda tutulmaz.
GitHub OIDC kimliği yalnız bu deponun main dalındaki tnf.yml dosyası için kabul edilir.
Instagram anahtarı GitHub'a verilmez. Sunucu bağlantısı Sites tarafında gizli tutulur.

Actions > TNF Canli RSS > Run workflow ile probe=true bağlantı testi yapılabilir.
Bu test paylaşım yapmaz. Canlı denemeden önce site durumunu ve tasarım kaydını kontrol edin.

Yeni haber yoksa bekler. Yayın sonucu belirsizse aynı haberi zorla yeniden göndermez.
Fotoğraf + Reels profilinde tek haberden iki içerik; yalnız Reels profilinde sadece video üretilir.
Video aynı tasarımla 10 saniye, H.264/AAC MP4 olarak FFmpeg ile hazırlanır.
Bu sürüm kaynak çözünürlüğü ve kayıtlı keskinlik ayarını kullanır; tarayıcıdaki ESRGAN modeli çalıştırılmaz.
Public depolardaki zamanlanmış işler 60 gün depo etkinliği olmazsa GitHub tarafından durdurulabilir.
Depoya parola, token, haber verisi veya kişisel tasarım kaydı koymayın.
