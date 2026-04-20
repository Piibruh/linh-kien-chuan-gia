/**
 * reviewStore.ts
 * Quản lý đánh giá sản phẩm — 5 người dùng demo + reviews thật (seed sẵn)
 * Ưu tiên hiển thị 4-5 sao. Không hiển thị nếu chỉ có 1-3 sao.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ReviewUser {
  id: string;
  name: string;
  avatar: string; // initials-based color avatar
  email: string;
  password: string;
  role: 'user';
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1–5
  title: string;
  body: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
}

export interface ReviewSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
  /** Chỉ hiển thị nếu có ít nhất 1 đánh giá 4+ sao */
  showRating: boolean;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

// ── 5 Demo users (ngoài admin/staff/user) ─────────────────────────────────────

export const REVIEW_DEMO_USERS: ReviewUser[] = [
  {
    id: 'rv_u1',
    name: 'Trần Minh Khoa',
    avatar: 'TK',
    email: 'khoa.tran@gmail.com',
    password: 'khoa123',
    role: 'user',
  },
  {
    id: 'rv_u2',
    name: 'Lê Thị Hoa',
    avatar: 'LH',
    email: 'hoa.le@gmail.com',
    password: 'hoa123',
    role: 'user',
  },
  {
    id: 'rv_u3',
    name: 'Phạm Đức Tài',
    avatar: 'PT',
    email: 'tai.pham@gmail.com',
    password: 'tai123',
    role: 'user',
  },
  {
    id: 'rv_u4',
    name: 'Nguyễn Thu Hằng',
    avatar: 'NH',
    email: 'hang.nguyen@gmail.com',
    password: 'hang123',
    role: 'user',
  },
  {
    id: 'rv_u5',
    name: 'Võ Quốc Bảo',
    avatar: 'VB',
    email: 'bao.vo@gmail.com',
    password: 'bao123',
    role: 'user',
  },
];

// ── Seed reviews (thật, gắn với product IDs từ products.json) ─────────────────
// Product IDs: p1–p20+ — ta seed cho 10 sản phẩm phổ biến nhất

const seed = (id: string, pid: string, uid: string, rating: number, title: string, body: string, helpful: number, daysAgo: number, verified = true): Review => ({
  id,
  productId: pid,
  userId: uid,
  userName: REVIEW_DEMO_USERS.find(u => u.id === uid)?.name ?? 'Người dùng',
  userAvatar: REVIEW_DEMO_USERS.find(u => u.id === uid)?.avatar ?? '??',
  rating,
  title,
  body,
  helpful,
  verified,
  createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
});

export const SEED_REVIEWS: Review[] = [
  // ── p1: Arduino UNO R3 ─────────────────────────────────────────────────────
  seed('r1',  'p1', 'rv_u1', 5, 'Sản phẩm chất lượng cao', 'Mua về dùng làm project IoT, chạy rất ổn định. Hàng đúng chuẩn, giao nhanh. Sẽ mua lại lần sau!', 14, 12),
  seed('r2',  'p1', 'rv_u2', 5, 'Đúng hàng, chạy tốt', 'Arduino UNO chính hãng, đấu với IDE không cần cài driver thêm. Chạy blink sketch ngay lần đầu. Hài lòng!', 9, 20),
  seed('r3',  'p1', 'rv_u3', 4, 'Tốt nhưng hộp hơi đơn giản', 'Board Arduino chạy ngon, tuy nhiên bao bì có vẻ đơn giản hơn mong đợi. Chất lượng linh kiện thì OK.', 6, 35),
  seed('r4',  'p1', 'rv_u4', 5, 'Hoàn hảo cho người mới học', 'Mua cho con học lập trình Arduino, dễ dùng, pin cắm ổn, không bị lỏng. Giá hợp lý.', 11, 5),

  // ── p2: ESP32 DevKit ───────────────────────────────────────────────────────
  seed('r5',  'p2', 'rv_u2', 5, 'WiFi + BT tuyệt vời', 'Dùng làm smart home, kết nối WiFi cực mượt. Chưa thấy bị ngắt kết nối sau 2 tuần test liên tục.', 18, 8),
  seed('r6',  'p2', 'rv_u5', 5, 'ESP32 ngon nhất phân khúc này', 'Chip Xtensa dual-core chạy nhanh, flash 4MB đủ dùng. Upload code qua USB-C ngon.', 12, 15),
  seed('r7',  'p2', 'rv_u3', 4, 'Đáng tiền', 'Board tốt, chỉ tiếc là tài liệu tiếng Việt còn ít. Nhưng giá so với chức năng thì quá ổn.', 7, 22),
  seed('r8',  'p2', 'rv_u1', 5, 'Giao hàng siêu nhanh', 'Đặt buổi sáng, chiều đã nhận hàng. Board ESP32 chạy MicroPython không vấn đề gì. Shop uy tín!', 15, 3),

  // ── p3: Raspberry Pi 4 ─────────────────────────────────────────────────────
  seed('r9',  'p3', 'rv_u4', 5, 'Mini PC mạnh mẽ', 'Cài Ubuntu Server chạy Docker, xử lý ngon cho server nhỏ. RAM 4GB thoải mái chạy nhiều container. Rất đáng mua.', 23, 10),
  seed('r10', 'p3', 'rv_u1', 4, 'Cần thêm tản nhiệt', 'Pi 4 mạnh nhưng nóng, cần mua thêm case có quạt. Bản thân board thì tuyệt, nên mua kèm phụ kiện.', 16, 18),
  seed('r11', 'p3', 'rv_u5', 5, 'Dùng làm media server xịn', 'Cài Kodi lên, xem 4K mượt. Hàng chính hãng, có tem đầy đủ. Rất thỏa mãn với giá mua được.', 19, 7),

  // ── p4: DHT22 Sensor ──────────────────────────────────────────────────────
  seed('r12', 'p4', 'rv_u3', 5, 'Cảm biến chính xác', 'Đo nhiệt độ phòng so sánh với nhiệt kế xịn chênh lệch 0.2°C. Ẩm độ cũng chính xác. Giá rẻ mà chất.', 10, 14),
  seed('r13', 'p4', 'rv_u2', 4, 'Đáng dùng cho dự án học sinh', 'DHT22 dễ kết nối với Arduino, thư viện có sẵn. Đọc được cả nhiệt độ lẫn độ ẩm. Tốt cho dự án nhỏ.', 8, 25),
  seed('r14', 'p4', 'rv_u5', 5, 'Giao nhanh, hàng đẹp', 'Cảm biến đóng gói cẩn thận, không bị cong chân. Hoạt động tốt ngay lần cắm đầu tiên. Sẽ mua thêm.', 13, 6),

  // ── p5: PIR Motion Sensor ─────────────────────────────────────────────────
  seed('r15', 'p5', 'rv_u1', 5, 'Nhạy cảm và ổn định', 'Cài đặt dễ, độ nhạy điều chỉnh được. Dùng cho hệ thống báo động nhỏ rất ổn. Giá phải chăng.', 7, 9),
  seed('r16', 'p5', 'rv_u4', 4, 'Tốt cho project nhỏ', 'PIR dễ dùng, khoảng cách phát hiện có thể chỉnh được. Đáng đồng tiền.', 5, 20),
  seed('r17', 'p5', 'rv_u2', 5, 'Hoạt động ổn định', 'Sau 1 tháng dùng trong project an ninh nhà, chưa bao giờ phát hiện sai. Rất đáng mua.', 11, 4),

  // ── p6: L298N Motor Driver ────────────────────────────────────────────────
  seed('r18', 'p6', 'rv_u5', 5, 'Điều khiển motor chuẩn', 'Dùng cho robot xe 2 bánh, điều khiển cả 2 motor DC cùng lúc ngon lành. Mạch chắc chắn.', 12, 11),
  seed('r19', 'p6', 'rv_u3', 4, 'Cần tản nhiệt thêm', 'Module tốt nhưng khi chạy tải cao thì nóng, cần gắn tản nhiệt. Bình thường thì OK lắm.', 6, 28),

  // ── p7: OLED 0.96" I2C ───────────────────────────────────────────────────
  seed('r20', 'p7', 'rv_u4', 5, 'Màn hình nhỏ nhưng rõ nét', 'OLED trắng rất rõ dù nhỏ, hiển thị text mượt. Thư viện Adafruit dễ dùng. Đáng đồng tiền!', 14, 13),
  seed('r21', 'p7', 'rv_u1', 5, 'Màn đẹp giá tốt', 'Giao hàng nhanh, màn không bị điểm chết. Dùng I2C chỉ cần 2 dây. Tuyệt vời cho dự án hiển thị.', 17, 8),
  seed('r22', 'p7', 'rv_u2', 4, 'Chất lượng tốt', 'Module OLED hoạt động tốt, chỉ cần cài thư viện đúng là dùng được ngay.', 9, 30),

  // ── p8: Relay 5V Module ───────────────────────────────────────────────────
  seed('r23', 'p8', 'rv_u5', 5, 'Relay chuyển mạch mượt', 'Điều khiển bóng đèn 220V qua Arduino, hoạt động cực ổn. Module chất lượng, hàn chắc chắn.', 10, 16),
  seed('r24', 'p8', 'rv_u3', 4, 'Đáng tin cậy', 'Relay đóng mở chính xác, nhạy với tín hiệu 5V từ Arduino. Tốt cho các ứng dụng điều khiển tải.', 7, 21),

  // ── p9: HC-SR04 Ultrasonic ────────────────────────────────────────────────
  seed('r25', 'p9', 'rv_u2', 5, 'Đo khoảng cách chuẩn', 'Sai số < 1cm khi đo trong khoảng 2-400cm. Thư viện nhiều, dễ lập trình. Đẹp hơn mong đợi.', 16, 17),
  seed('r26', 'p9', 'rv_u4', 4, 'Dễ dùng, giá ổn', 'Cảm biến siêu âm dễ tích hợp, thư viện ready. Dùng project tránh vật cản robot rất tốt.', 8, 24),
  seed('r27', 'p9', 'rv_u1', 5, 'Hàng chất', 'Đo chính xác, không nhiễu. Đã mua 3 cái, tất cả đều hoạt động tốt. Shop đóng gói cẩn thận.', 14, 5),

  // ── p10: Breadboard 830 ───────────────────────────────────────────────────
  seed('r28', 'p10', 'rv_u3', 5, 'Breadboard chuẩn, chắc chắn', 'Lỗ cắm vừa khít, không bị lỏng hay quá chặt. Màu trắng đẹp, nhìn rõ line hơn. Mua mấy cái dùng mãi.', 11, 19),
  seed('r29', 'p10', 'rv_u5', 4, 'Chất lượng ổn', 'Breadboard đủ ô, giá tốt. Phù hợp học tập và thực hành mạch điện tử cơ bản.', 6, 31),
];

// ── Store ─────────────────────────────────────────────────────────────────────

interface ReviewState {
  reviews: Review[];
  /** Thêm review mới */
  addReview: (review: Omit<Review, 'id' | 'helpful' | 'createdAt'>) => void;
  /** Toggle helpful */
  markHelpful: (reviewId: string) => void;
  /** Lấy reviews theo productId — ưu tiên 5→4 sao, bỏ qua nếu max < 4 */
  getProductReviews: (productId: string) => Review[];
  /** Summary cho một product */
  getProductSummary: (productId: string) => ReviewSummary;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: SEED_REVIEWS,

      addReview: (partial) => {
        const review: Review = {
          ...partial,
          id: `rv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          helpful: 0,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ reviews: [review, ...s.reviews] }));
      },

      markHelpful: (reviewId) => {
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
          ),
        }));
      },

      getProductReviews: (productId) => {
        const all = get().reviews.filter((r) => r.productId === productId);
        const hasHighRating = all.some((r) => r.rating >= 4);
        if (!hasHighRating) return []; // chỉ có ≤3 sao → không hiển thị
        // Sắp xếp: 5 sao trước, 4 sao sau, theo helpful
        return [...all]
          .filter((r) => r.rating >= 4)
          .sort((a, b) => b.rating - a.rating || b.helpful - a.helpful);
      },

      getProductSummary: (productId) => {
        const all = get().reviews.filter((r) => r.productId === productId);
        const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
        let total = 0;
        for (const r of all) {
          dist[r.rating as 1 | 2 | 3 | 4 | 5]++;
          total += r.rating;
        }
        const avg = all.length > 0 ? Math.round((total / all.length) * 10) / 10 : 0;
        const hasHighRating = all.some((r) => r.rating >= 4);
        return {
          productId,
          averageRating: avg,
          totalReviews: all.length,
          showRating: hasHighRating,
          distribution: dist,
        };
      },
    }),
    {
      name: 'electro-reviews',
      // Chỉ persist reviews do user thêm mới; seed luôn được merge
      partialState: (s) => ({ reviews: s.reviews }),
    } as any,
  )
);
