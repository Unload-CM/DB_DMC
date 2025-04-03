import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 환경 변수 직접 하드코딩 (Vercel 배포 문제 해결용)
const supabaseUrl = 'https://fpfinpuncamlpbbimwtu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZmlucHVuY2FtbHBiYmltd3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDEwMzQsImV4cCI6MjA1OTE3NzAzNH0.PkUdieMcJbIvReXzmCw-glNQdn2Ni4XdIOHSbYx8hJE';

// 확장된 Supabase 클라이언트 타입 정의
interface EnhancedSupabaseClient extends SupabaseClient {
  checkConnection?: () => Promise<{ ok: boolean; error?: any }>;
}

let supabaseInstance: EnhancedSupabaseClient | null = null;

// 환경 변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase 환경 변수가 설정되지 않았습니다:',
    { url: !!supabaseUrl, key: !!supabaseAnonKey }
  );
}

// 클라이언트 초기화 시도
try {
  console.log('Supabase 클라이언트 초기화 시도:', { 
    url: supabaseUrl,
    keyLength: supabaseAnonKey?.length || 0
  });

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  // 클라이언트 연결성 확인 함수 
  supabaseInstance.checkConnection = async () => {
    try {
      // 간단한 쿼리로 연결 확인
      const { error } = await supabaseInstance!.from('inventory').select('id').limit(1);
      if (error && error.code === 'PGRST116') {
        // 테이블이 없어도 연결은 성공으로 간주
        return { ok: true };
      }
      
      if (error) {
        console.error('Supabase 연결 오류:', error);
        return { ok: false, error };
      }
      
      return { ok: true };
    } catch (err) {
      console.error('Supabase 연결 확인 중 오류:', err);
      return { ok: false, error: err };
    }
  };

  console.log('Supabase 클라이언트가 성공적으로 초기화되었습니다.');
} catch (error) {
  console.error('Supabase 클라이언트 초기화 실패:', error);
}

// 클라이언트 인스턴스 내보내기
export const supabase = supabaseInstance || createClient(supabaseUrl, supabaseAnonKey); 