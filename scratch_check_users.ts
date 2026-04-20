
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.taiKhoan.findMany({
    include: { nguoiDung: true },
  });
  console.log('Total accounts:', users.length);
  users.forEach((tk) => {
    console.log(`- ${tk.tenDangNhap} (Role: ${tk.quyenHan}, Status: ${tk.trangThai})`);
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
