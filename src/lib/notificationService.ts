import { supabase } from './supabase';
import { Notification, ActionType } from '@/types';

/**
 * 알림 생성 함수
 * @param userId 사용자 ID
 * @param userName 사용자 이름
 * @param actionType 알림 유형
 * @param content 알림 내용
 * @param relatedId 관련 아이템 ID
 * @param relatedType 관련 아이템 타입
 * @returns 생성된 알림 ID
 */
export async function createNotification(
  userId: string,
  userName: string,
  actionType: ActionType,
  content: string,
  relatedId?: string,
  relatedType?: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        user_name: userName,
        action_type: actionType,
        content: content,
        created_at: new Date().toISOString(),
        is_read: false,
        related_id: relatedId,
        related_type: relatedType
      })
      .select('id')
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('알림 생성 오류:', error);
    return null;
  }
}

/**
 * 알림 목록 가져오기
 * @param limit 가져올 알림 개수
 * @returns 알림 목록
 */
export async function getNotifications(limit: number = 10): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Notification[];
  } catch (error) {
    console.error('알림 목록 가져오기 오류:', error);
    return [];
  }
}

/**
 * 읽지 않은 알림 개수 가져오기
 * @returns 읽지 않은 알림 개수
 */
export async function getUnreadNotificationsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('읽지 않은 알림 개수 가져오기 오류:', error);
    return 0;
  }
}

/**
 * 알림 읽음 표시
 * @param notificationId 알림 ID
 * @returns 성공 여부
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('알림 읽음 표시 오류:', error);
    return false;
  }
}

/**
 * 모든 알림 읽음 표시
 * @returns 성공 여부
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('모든 알림 읽음 표시 오류:', error);
    return false;
  }
}

/**
 * 사용자별 알림 목록 가져오기
 * @param userId 사용자 ID
 * @param limit 가져올 알림 개수
 * @returns 알림 목록
 */
export async function getUserNotifications(userId: string, limit: number = 10): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Notification[];
  } catch (error) {
    console.error('사용자별 알림 목록 가져오기 오류:', error);
    return [];
  }
}

/**
 * 알림 삭제
 * @param notificationId 알림 ID
 * @returns 성공 여부
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('알림 삭제 오류:', error);
    return false;
  }
}

/**
 * 지정된 기간보다 오래된 알림 삭제
 * @param days 일 수 (기본값: 30일)
 * @returns 성공 여부
 */
export async function deleteOldNotifications(days: number = 30): Promise<boolean> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('오래된 알림 삭제 오류:', error);
    return false;
  }
} 