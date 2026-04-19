import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  gradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Arduino Starter Kit',
    subtitle: 'Bắt đầu hành trình IoT',
    description: 'Trọn bộ Arduino UNO với 20+ linh kiện và hướng dẫn chi tiết',
    buttonText: 'Mua ngay',
    buttonLink: '/category/vi-dieu-khien',
    image: 'https://images.unsplash.com/photo-1651231960369-3c31ab2a490c?w=800',
    gradient: 'from-primary to-accent',
  },
  {
    id: 2,
    title: 'Giảm giá cảm biến',
    subtitle: 'Flash Sale 24h',
    description: 'Giảm đến 40% cho tất cả cảm biến nhiệt độ, độ ẩm, ánh sáng',
    buttonText: 'Xem ngay',
    buttonLink: '/category/cam-bien',
    image: 'https://images.unsplash.com/photo-1662528730018-45ff5ffb6c67?w=800',
    gradient: 'from-destructive to-orange-500',
  },
  {
    id: 3,
    title: 'ESP32 DevKit',
    subtitle: 'WiFi + Bluetooth',
    description: 'Vi điều khiển mạnh mẽ với kết nối không dây tích hợp',
    buttonText: 'Khám phá',
    buttonLink: '/category/vi-dieu-khien',
    image: 'https://images.unsplash.com/photo-1634452015397-ad0686a2ae2d?w=800',
    gradient: 'from-accent to-primary',
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
          }`}
        >
          <div className={`w-full h-full bg-gradient-to-r ${slide.gradient} text-white`}>
            <div className="container mx-auto px-4 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full">
                {/* Content */}
                <div className="py-12 lg:py-0">
                  <div className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {slide.subtitle}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
                    {slide.description}
                  </p>
                  <Link
                    to={slide.buttonLink}
                    className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-bold hover:bg-white/90 transition-all active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    {slide.buttonText}
                  </Link>
                </div>

                {/* Image */}
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur rounded-2xl border border-white/20"></div>
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur transition-all z-10"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur transition-all z-10"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
