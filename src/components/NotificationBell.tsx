'use client';

import { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { getNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notificationService';
import { Notification } from '@/types';
import { useTranslation } from 'react-i18next';
import '../lib/i18n';

export default function NotificationBell() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 외부 클릭 감지
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // 이벤트 리스너 등록
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // 초기 로딩 및 주기적 업데이트
    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    }, 30000); // 30초마다 업데이트

    return () => clearInterval(interval);
  }, [isOpen]);

  // 알림 목록 가져오기
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications(10);
      setNotifications(data);
    } catch (error) {
      console.error('알림 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 읽지 않은 알림 개수 가져오기
  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('읽지 않은 알림 개수 로딩 실패:', error);
    }
  };

  // 알림 클릭 처리
  const handleNotificationClick = async (notification: Notification) => {
    // 읽음 처리
    if (!notification.is_read) {
      const success = await markNotificationAsRead(notification.id);
      if (success) {
        // 읽음 상태 업데이트
        setNotifications(
          notifications.map(n => 
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        // 읽지 않은 알림 수 감소
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }

    // 관련 페이지로 이동 기능은 추후 구현
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    const success = await markAllNotificationsAsRead();
    if (success) {
      // 모든 알림 읽음 상태로 업데이트
      setNotifications(
        notifications.map(n => ({ ...n, is_read: true }))
      );
      // 읽지 않은 알림 수 초기화
      setUnreadCount(0);
    }
  };

  // 알림 시간 포맷
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) {
      return t('notification.just_now');
    } else if (diffMinutes < 60) {
      return `${diffMinutes}${t('notification.minutes_ago')}`;
    } else if (diffMinutes < 24 * 60) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}${t('notification.hours_ago')}`;
    } else {
      const days = Math.floor(diffMinutes / (24 * 60));
      return `${days}${t('notification.days_ago')}`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 알림 벨 아이콘 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-blue-600 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
        aria-label="알림"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 알림 드롭다운 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          {/* 알림 헤더 */}
          <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white">
            <h3 className="text-sm font-medium">{t('notification.notifications')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs hover:underline focus:outline-none"
              >
                {t('notification.mark_all_as_read')}
              </button>
            )}
          </div>

          {/* 알림 목록 */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : notifications.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-800">{notification.content}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">{formatTime(notification.created_at)}</span>
                        {!notification.is_read && (
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                <p>{t('notification.no_notifications')}</p>
              </div>
            )}
          </div>

          {/* 알림 푸터 */}
          <div className="px-4 py-2 bg-gray-50 text-xs text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {t('notification.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 