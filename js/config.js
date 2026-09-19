// 이 값들은 공개되어도 안전합니다.
// - SUPABASE_URL / SUPABASE_ANON_KEY: 실제 데이터 접근 권한은 서버의 RLS(행 단위 보안 정책)가 막아주므로
//   이 키만으로는 남의 데이터를 볼 수 없습니다.
// - TOSS_CLIENT_KEY: 결제창을 여는 용도로만 쓰이며, 실제 결제 승인은
//   시크릿 키를 가진 서버(Supabase Edge Function)에서만 처리합니다.

export const SUPABASE_URL = "https://eyxnknlfjpzgajbtpzns.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5eG5rbmxmanB6Z2FqYnRwem5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NTUxODYsImV4cCI6MjEwNTIzMTE4Nn0.gL77ScGOFG1ob03PspOVw_m2-TytSw9sTWUxv2js_80";

// TODO(사용자): 토스페이먼츠 개발자센터 → 테스트 클라이언트 키(test_ck_...)로 교체하세요.
export const TOSS_CLIENT_KEY = "REPLACE_ME_TOSS_CLIENT_KEY";
