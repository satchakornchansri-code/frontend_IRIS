# Stage 1: Install dependencies
# ใช้ node:18-alpine เพื่อขนาดที่เล็ก (เปลี่ยน version ตามที่โปรเจกต์ใช้)
FROM node:18-alpine AS deps
# ลง libc6-compat เนื่องจากบาง library อาจต้องการใช้งาน
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files เพื่อ install dependencies
COPY package.json package-lock.json* ./ 
# ถ้าใช้ yarn หรือ pnpm ให้ copy yarn.lock* หรือ pnpm-lock.yaml* ด้วย

# Install dependencies (ใช้ ci สำหรับ clean install)
RUN npm ci 
# หรือ RUN yarn install --frozen-lockfile

# Stage 2: Build the app
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ปิด Telemetry ของ Next.js ระหว่าง build
ENV NEXT_TELEMETRY_DISABLED 1

# สั่ง Build โปรเจกต์
RUN npm run build
# หรือ RUN yarn build

# Stage 3: Production Server
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# สร้าง User ใหม่เพื่อความปลอดภัย (ไม่รันด้วย root)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder (ถ้ามีรูปภาพหรือไฟล์ static)
COPY --from=builder /app/public ./public

# Copy ไฟล์ที่ build เสร็จแล้วจากโหมด standalone
# ต้องจัดสิทธิ์ (chown) ให้ user nextjs เป็นเจ้าของไฟล์
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# เปลี่ยนไปใช้ user nextjs
USER nextjs

# Expose Port 3000
EXPOSE 3000

ENV PORT 3000
# ใช้ node server.js แทน npm start ในโหมด standalone
CMD ["node", "server.js"]