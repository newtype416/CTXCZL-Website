import ScrollReveal from './ScrollReveal';
import SplitText from './SplitText';
import { motion } from 'motion/react';
import ProfileCard from './ProfileCard';
import Particles from './Particles';

// ÿ�����������´��䣻���ɵ�������֮��
const floatingTags = [
  // ���� ��һ�ţ����������Ҹ��������������Ҵ��� ����
  // ���
  { label: '生日', value: '2002.7.30', style: { top: '10%', left: '15%', rotate: -4 }, delay: 0.05 },
  { label: 'MBTI', value: 'INFJ',    style: { top: '14%', left: '25%', rotate: 3 }, delay: 0.1 },
  // �Ҳ�
  { label: '出生地', value: '湖南岳阳', style: { top: '12%', right: '13%', rotate: 5 }, delay: 0.15 },
  { label: '身高',   value: '183cm',   style: { top: '16%', right: '22%', rotate: -3 }, delay: 0.2 },
  // ���� �ڶ��ţ����������Ҹ��������������Ҵ��� ����
  // ���
  { label: '毕业院校', value: '中华女子学院', style: { top: '30%', left: '5%', rotate: -3 }, delay: 0.25 },
  { label: '专业',   value: '播音与主持',   style: { top: '37%', left: '13%', rotate: 4 }, delay: 0.3 },
  // �Ҳ�
  { label: '喜欢的水果', value: '柚子',   style: { top: '33%', right: '13%', rotate: 2 }, delay: 0.35 },
  { label: '喜欢的人', value: '橙子粒', style: { top: '32%', right: '3%', rotate: -4 }, delay: 0.4 },
];

// �罻�����ƣ��߶�Լ 320���� / �� / ���£��ɵ�Ф��
const socialLinks = [
  {
    name: '微博',
    handle: '演员陈添祥',
    status: '一位正在努力的小演员',
    color: '#E6162D',
    url: 'https://weibo.com/u/6871895822',
    iconImage: '/images/about/weibo.jpg',
    cardImage: '/images/about/weibo-card.jpg',
    delay: 0.15,
    style: { left: '2%', top: 'calc(53% + 10px)', rotate: -3 },
  },
  {
    name: '抖音',
    handle: '陈添祥',
    status: '演员道路上的小学生',
    color: '#111111',
    url: 'https://v.douyin.com/4VKw4PJDLnc/',
    iconImage: '/images/about/douyin.jpg',
    cardImage: '/images/about/douyin-card.png',
    delay: 0.25,
    style: { left: '50%', top: 'calc(57% + 10px)', rotate: 2, xCenter: true },
  },
  {
    name: '小红书',
    handle: '陈添祥',
    status: '演员 陈添祥',
    color: '#FE2C55',
    url: 'https://xhslink.cn/m/57vZycMxaHa',
    iconImage: '/images/about/xiaohongshu.jpg',
    cardImage: '/images/about/xiaohongshu-card.jpg',
    delay: 0.35,
    style: { right: '2%', top: 'calc(51% + 10px)', rotate: 4 },
  },
];

function FloatingTag({ label, value, style, delay = 0 }) {
  const { rotate = 0, ...pos } = style;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: false, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, scale: 1.04 }}
      className="absolute z-30 hidden md:block"
      style={pos}
    >
      <div
        className="cursor-default rounded-2xl border border-white/80 bg-white/90 px-4 py-2.5 shadow-[0_10px_30px_rgba(230,96,26,0.12)] backdrop-blur-sm"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        <p className="mb-0.5 text-[10px] tracking-[0.18em] text-warm-500">{label}</p>
        <p className="whitespace-nowrap text-sm font-medium text-gray-800">{value}</p>
      </div>
    </motion.div>
  );
}

function SocialCard({ social, index }) {
  const { rotate = 0, xCenter, ...pos } = social.style;
  return (
    <motion.a
      href={social.url}
      target="_blank"
      rel="noreferrer"
      aria-label={social.name}
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: '-40px' }}
      transition={{ duration: 0.65, delay: social.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="absolute z-40 block"
      style={{
        ...pos,
        transform: xCenter
          ? `translateX(-50%) rotate(${rotate}deg)`
          : `rotate(${rotate}deg)`,
      }}
    >
      <ProfileCard
        name={social.name}
        title={social.handle}
        handle={social.handle}
        status={social.status}
        avatarUrl={social.cardImage}
        miniAvatarUrl={social.iconImage}
        contactText="查看主页"
        behindGlowColor={social.color}
        className={index < 2 ? 'profile-card--desktop profile-card--normal' : 'profile-card--desktop'}
      />
    </motion.a>
  );
}

export default function AboutSection() {
  return (
    <>
      <section id="about" className="relative min-h-screen overflow-hidden bg-cream pt-[115px] pb-[60px] md:pt-[175px] md:pb-[92px]">
      <Particles
        className="absolute inset-0 z-0 h-full w-full"
        particleCount={200}
        particleSpread={10}
        speed={0.6}
        particleColors={["#ff6b6b", "#6b98e2", "#Fa730a"]}
        moveParticlesOnHover
        particleHoverFactor={1}
        alphaParticles
        particleBaseSize={500}
        sizeRandomness={1}
        cameraDistance={20}
        disableRotation={false}
      />
      <div className="pointer-events-none absolute left-[12%] top-[18%] h-72 w-72 rounded-full bg-warm-300/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[12%] right-[10%] h-96 w-96 rounded-full bg-warm-200/20 blur-3xl" />

      <div className="section-container relative z-10">
        <ScrollReveal>
          <div className="mb-8 text-center md:mb-12">
            <SplitText
                text="ABOUT CTX"
  		   tag="h2"
  		   className="font-[Microsoft_YaHei] text-[43px] font-black tracking-wide text-gray-800 md:text-[58px] lg:text-[72px] mt-[5px]"
  		   delay={100}
  		   duration={1.2}
  		   ease="power3.out"
  		   splitType="words"
  		   from={{ opacity: 0, y: 40 }}
  		   to={{ opacity: 1, y: 0 }}
  		   threshold={0}
  		   rootMargin="200px"
  		   textAlign="center"
            />
            <div className="flex justify-center">
              <SplitText
                text="一位正在努力的小演员(茁壮成长版…)"
                tag="p"
                className="mt-3 text-sm tracking-widest text-gray-600"
                delay={100}
                duration={1.2}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0}
                rootMargin="200px"
                textAlign="center"
              />
            </div>
            <div className="mx-auto mt-5 h-[2px] w-14 bg-gradient-to-r from-warm-400 to-warm-300" />
          </div>
        </ScrollReveal>

        {/* Desktop */}
        <div className="relative mx-auto hidden min-h-[980px] max-w-6xl md:block">
          {/* Portrait under tags & social */}
          <div className="absolute left-1/2 top-[40%] z-10 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative"
            >
              <div className="absolute -inset-6 -z-10 rounded-full bg-warm-300/25 blur-2xl" />
              <div className="absolute -inset-12 -z-20 rounded-full bg-warm-200/20 blur-3xl" />
              <motion.img
                src="/images/about/portrait.png"
                alt="陈添祥"
                className="h-[800px] w-[400px] max-w-[400px] object-contain object-center drop-shadow-[0_30px_50px_rgba(230,96,26,0.28)]"
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>

          {floatingTags.map((tag) => (
            <FloatingTag key={tag.label} {...tag} />
          ))}

          {socialLinks.map((social, index) => (
            <SocialCard key={social.name} social={social} index={index} />
          ))}
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="relative mx-auto mb-6 min-h-[405px] sm:min-h-[455px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7 }}
              className="relative z-10 mx-auto flex justify-center pt-4"
            >
              <div className="absolute -inset-4 -z-10 rounded-full bg-warm-300/25 blur-2xl" />
              <motion.img
                src="/images/about/portrait.png"
                alt="???"
                className="h-[360px] w-auto max-w-full object-contain object-center drop-shadow-[0_24px_36px_rgba(230,96,26,0.22)] sm:h-[410px]"
                loading="lazy"
              />
            </motion.div>

            <div className="relative z-30 -mt-16 flex flex-wrap justify-center gap-x-3 gap-y-4 px-2">
              {floatingTags.map((tag, i) => (
                <motion.div
                  key={tag.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  className="rounded-2xl border border-white/80 bg-white/90 px-3.5 py-2 shadow-md shadow-warm-200/20 backdrop-blur-sm"
                  style={{
                    transform: `translateY(${i % 2 === 0 ? -8 : 10}px) rotate(${i % 2 === 0 ? -2 : 2}deg)`,
                    width: 'calc(50% - 0.5rem)',
                    maxWidth: '160px',
                  }}
                >
                  <p className="text-[10px] tracking-wider text-warm-500">{tag.label}</p>
                  <p className="text-sm font-medium text-gray-800">{tag.value}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative z-40 mx-auto flex max-w-sm flex-col gap-4">
            {socialLinks.map((social, i) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="block w-full"
                style={{
                  marginLeft: i === 1 ? 16 : i === 2 ? 8 : 0,
                  transform: `rotate(${i === 0 ? -2 : i === 2 ? 2 : 0}deg)`,
                }}
              >
                <ProfileCard
                  name={social.name}
                  title={social.handle}
                  handle={social.handle}
                  status={social.status}
                  avatarUrl={social.cardImage}
                  miniAvatarUrl={social.iconImage}
                  contactText="查看主页"
                  behindGlowColor={social.color}
                className={i < 2 ? 'profile-card--normal' : ''}
              />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

    </section>

    </>
  );
}

