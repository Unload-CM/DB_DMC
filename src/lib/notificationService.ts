import { supabase } from '@/lib/supabase';
import { Notification, ActionType } from '@/types';

// 알림 생성
export async function createNotification(
  userId: string,
  userName: string,
  actionType: ActionType,
  content: string,
  relatedId?: string,
  relatedType?: string
): Promise<Notification | null> {
  try {
    // 테이블이 없는 경우 생성
    await createNotificationsTableIfNotExists();

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          user_name: userName,
          action_type: actionType,
          content,
          is_read: false,
          related_id: relatedId,
          related_type: relatedType,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('알림 생성 오류:', error);
      return null;
    }

    return data as Notification;
  } catch (error) {
    console.error('알림 생성 중 예상치 못한 오류:', error);
    return null;
  }
}

// 알림 목록 가져오기
export async function getNotifications(limit: number = 20, isRead?: boolean): Promise<Notification[]> {
  try {
    // 테이블이 없는 경우 생성
    await createNotificationsTableIfNotExists();

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (isRead !== undefined) {
      query = query.eq('is_read', isRead);
    }

    const { data, error } = await query;

    if (error) {
      console.error('알림 목록 로딩 오류:', error);
      return [];
    }

    return data as Notification[];
  } catch (error) {
    console.error('알림 목록 로딩 중 예상치 못한 오류:', error);
    return [];
  }
}

// 읽지 않은 알림 개수 가져오기
export async function getUnreadNotificationsCount(): Promise<number> {
  try {
    // 테이블이 없는 경우 생성
    await createNotificationsTableIfNotExists();

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) {
      console.error('읽지 않은 알림 개수 로딩 오류:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('읽지 않은 알림 개수 로딩 중 예상치 못한 오류:', error);
    return 0;
  }
}

// 알림 읽음 상태 업데이트
export async function markNotificationAsRead(notificationId: string, isRead: boolean = true): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: isRead })
      .eq('id', notificationId);

    if (error) {
      console.error('알림 읽음 상태 업데이트 오류:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('알림 읽음 상태 업데이트 중 예상치 못한 오류:', error);
    return false;
  }
}

// 모든 알림 읽음 상태로 표시
export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) {
      console.error('모든 알림 읽음 상태 업데이트 오류:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('모든 알림 읽음 상태 업데이트 중 예상치 못한 오류:', error);
    return false;
  }
}

// 알림 테이블이 없는 경우 생성
async function createNotificationsTableIfNotExists() {
  try {
    // 테이블 존재 여부 확인
    const { error } = await supabase.from('notifications').select('id').limit(1);
    
    if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
      console.log('알림 테이블이 존재하지 않습니다. 테이블을 생성합니다.');
      
      // 테이블이 없으면 Supabase 대시보드에서 수동으로 생성하도록 안내
      console.warn('알림 테이블을 자동으로 생성할 수 없습니다.');
      console.warn('Supabase 대시보드에서 다음 SQL을 실행하세요:');
      console.warn(`
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          user_name TEXT NOT NULL,
          action_type TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_read BOOLEAN DEFAULT FALSE,
          related_id TEXT,
          related_type TEXT
        );
      `);
      
      // 클라이언트에서는 임시로 메모리에 저장
      window.localStorage.setItem('notifications_table_needed', 'true');
    }
  } catch (error) {
    console.error('알림 테이블 확인/생성 중 예상치 못한 오류:', error);
  }
} 