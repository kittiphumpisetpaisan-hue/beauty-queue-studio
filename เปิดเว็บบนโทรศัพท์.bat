@echo off
echo ============================================
echo   Beauty Queue Studio - เปิดใช้งานบนโทรศัพท์
echo ============================================
echo.
echo กำลังสร้าง URL สาธารณะ...
echo กรุณารอสักครู่...
echo.
echo เมื่อเห็น URL แบบ https://xxxx.trycloudflare.com
echo ให้ copy URL นั้นไปเปิดบนโทรศัพท์ได้เลย
echo.
echo กด Ctrl+C เพื่อหยุด
echo ============================================
cloudflared tunnel --url http://localhost:3000
pause
