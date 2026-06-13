import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Star, MapPin, ShieldCheck, Clock, Wifi, Waves, UtensilsCrossed } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { FadeIn, StaggerGroup, StaggerItem } from '../components/motion/FadeIn';
import { RoomSearchBar } from '../components/home/RoomSearchBar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-aura-cream">
      <Navbar />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2000&auto=format&fit=crop"
            alt="Hashamatli 5 yulduzli mehmonxona"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-aura-emerald-dark/90 via-aura-emerald/70 to-aura-emerald-light/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-aura-emerald-dark/95 via-aura-emerald/60 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-36 pb-12 sm:pb-20 text-center">
          <FadeIn>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-aura-gold/40 text-aura-gold-light text-xs sm:text-sm font-medium tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              Hashamat. Osoyishtalik. AURA.
            </span>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              <span className="text-aura-gold">AURA</span> mehmonxonasida<br />
              o'zingizni his eting
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-base sm:text-xl text-aura-cream/90 mb-10 max-w-2xl mx-auto">
              Zamonaviy hashamat va sharqona mehmondo'stlik uyg'unligi. Xonalarni bron qiling,
              premium xizmatlardan bahramand bo'ling va AURA bilan unutilmas dam olishni boshlang.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16">
              <Link
                href="/rooms-select"
                className="bg-aura-gold text-aura-emerald-dark px-8 py-4 rounded-xl text-lg font-semibold hover:bg-aura-gold-light active:scale-95 transition-all shadow-lg shadow-aura-gold/30"
              >
                Xona tanlash
              </Link>
              <Link
                href="/auth/register"
                className="bg-white/10 text-white border-2 border-white/40 backdrop-blur-md px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 active:scale-95 transition-all"
              >
                Bepul ro'yxatdan o'tish
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <RoomSearchBar />
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <FadeIn>
          <p className="text-center text-aura-gold-dark font-semibold tracking-widest uppercase text-sm mb-3">
            Nega aynan AURA
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-aura-emerald-dark mb-12">
            Har bir tafsilotda yuqori sifat
          </h2>
        </FadeIn>
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { icon: Star, title: 'Premium xonalar', desc: '5 yulduzli standartdagi hashamatli interyer' },
            { icon: Waves, title: 'Spa & Basseyn', desc: 'Tana va ruhni tinchlantiruvchi premium zonalar' },
            { icon: MapPin, title: 'Qulay joylashuv', desc: 'Shahar markazidagi eng yaxshi manzillar' },
            { icon: ShieldCheck, title: "Xavfsiz to'lov", desc: "Himoyalangan onlayn to'lov tizimi" },
            { icon: UtensilsCrossed, title: 'Gurme oshxona', desc: "Dunyo taomlari va mahalliy noz-ne'matlar" },
            { icon: Wifi, title: 'Tezkor Wi-Fi', desc: 'Barcha xonalarda yuqori tezlikdagi internet' },
            { icon: Clock, title: '24/7 xizmat', desc: "Kunning istalgan vaqtida qo'llab-quvvatlash" },
            { icon: Sparkles, title: 'Maxsus tajriba', desc: 'Har bir mehmon uchun individual yondashuv' },
          ].map((feature, i) => (
            <StaggerItem key={i}>
              <div className="h-full bg-white rounded-2xl p-6 shadow-sm border border-aura-emerald/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-aura-emerald/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-aura-emerald" />
                </div>
                <h3 className="text-lg font-semibold text-aura-emerald-dark mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <FadeIn className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl order-2 lg:order-1 bg-gradient-to-br from-aura-emerald via-aura-emerald-dark to-aura-gold-dark flex items-center justify-center">
            <Sparkles className="h-20 w-20 text-aura-gold/50" />
          </FadeIn>
          <FadeIn delay={0.1} className="order-1 lg:order-2">
            <p className="text-aura-gold-dark font-semibold tracking-widest uppercase text-sm mb-3">
              AURA tajribasi
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-aura-emerald-dark mb-6 leading-snug">
              Har bir xona — o'ziga xos hikoya
            </h2>
            <p className="text-gray-600 text-base sm:text-lg mb-6">
              AURA mehmonxonasida zamonaviy dizayn va an'anaviy mehmondo'stlik
              uyg'unlashadi. Har bir burchak sizga qulaylik va estetika
              tuyg'usini his qildiradi — biznes safaridan bolme oylanish
              kuniga qadar.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Shaxsiy concierge xizmati',
                'Panoramik manzarali xonalar',
                'Premium minibarlar va spa to\'plamlari',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-aura-gold shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/rooms-select"
              className="inline-block bg-aura-emerald text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-aura-emerald-light active:scale-95 transition-all"
            >
              Xonalarni ko'rish
            </Link>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
