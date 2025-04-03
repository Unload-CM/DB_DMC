'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { FaTools, FaUsers, FaSitemap, FaDatabase, FaSearch } from 'react-icons/fa';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'user' | 'site' | 'data'>('user');
  const [refreshFlag, setRefreshFlag] = useState(0);
  
  // 페이지 새로고침 함수
  const refreshPage = () => {
    setRefreshFlag(prev => prev + 1);
  };
  
  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-300 flex items-center">
            <FaTools className="mr-3 text-blue-500" /> 관리자 패널
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">사용자, 사이트 및 데이터 관리 기능을 제공합니다.</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <TabButton 
            isActive={activeTab === 'user'} 
            onClick={() => setActiveTab('user')}
            icon="👥"
            label="사용자 관리"
          />
          <TabButton 
            isActive={activeTab === 'site'} 
            onClick={() => setActiveTab('site')}
            icon="🏗️"
            label="사이트 관리"
          />
          <TabButton 
            isActive={activeTab === 'data'} 
            onClick={() => setActiveTab('data')}
            icon="🗄️"
            label="데이터 관리"
          />
        </div>
        
        <div className="p-6">
          {activeTab === 'user' && <UserManagementTab key={`user-${refreshFlag}`} onRefresh={refreshPage} />}
          {activeTab === 'site' && <SiteManagementTab key={`site-${refreshFlag}`} onRefresh={refreshPage} />}
          {activeTab === 'data' && <DataManagementTab key={`data-${refreshFlag}`} onRefresh={refreshPage} />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ 
  isActive, 
  onClick, 
  icon, 
  label 
}: { 
  isActive: boolean; 
  onClick: () => void; 
  icon: string; 
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center py-4 px-6 text-sm font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500/10 to-blue-100/30 dark:from-blue-800/30 dark:to-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500 shadow-sm' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <span className="mr-2 text-xl">{icon}</span>
      <span>{label}</span>
      
      {/* 액티브 인디케이터 */}
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-300"></span>
      )}
    </button>
  );
}

// 사용자 관리 탭
function UserManagementTab({ onRefresh }: { onRefresh: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    email: '',
    full_name: '',
    role: 'user'
  });
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
          
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('사용자 목록 로딩 오류:', error.message || error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // 유저 생성 시 임시 비밀번호 (추후 사용자가 변경할 수 있음)
      const tempPassword = 'ChangeMe123!';
      
      // Supabase Auth로 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email as string,
        password: tempPassword,
        options: {
          data: {
            full_name: newUser.full_name,
            role: newUser.role
          }
        }
      });
      
      if (authError) throw authError;
      
      // 사용자 테이블에 추가 정보 저장
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user?.id,
            email: newUser.email,
            full_name: newUser.full_name,
            role: newUser.role,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (dbError) throw dbError;
      
      // 새로운 사용자 추가 후 목록 새로고침
      onRefresh();
      fetchUsers();
      setShowAddModal(false);
      setNewUser({
        email: '',
        full_name: '',
        role: 'user'
      });
      
      alert(`사용자가 생성되었습니다. 임시 비밀번호는 ${tempPassword} 입니다.`);
      
    } catch (error: any) {
      console.error('사용자 추가 오류:', error.message || error);
      alert('사용자 추가 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`사용자 ${email}을 삭제하시겠습니까?`)) return;
    
    try {
      // 사용자 데이터 삭제
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;
      
      // Supabase Auth에서 사용자 삭제 (관리자 기능 필요)
      // 실제로는 Supabase 대시보드나 Admin API를 통해 수행해야 함
      alert('사용자 정보가 삭제되었습니다. Auth 항목은 관리자가 Supabase 대시보드에서 삭제해야 합니다.');
      
      // 목록 새로고침
      fetchUsers();
    } catch (error) {
      console.error('사용자 삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };
  
  // 검색어에 따른 필터링
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-lg font-semibold">사용자 관리</h2>
        
        <div className="flex mt-4 md:mt-0 space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <span className="mr-1">+</span> 사용자 등록
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full animate-ping opacity-75"></div>
            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">이름</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">이메일</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">역할</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">가입일</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">{user.full_name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {user.role === 'admin' ? '관리자' : '일반 사용자'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">등록된 사용자가 없습니다.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새 사용자 등록하기
          </button>
        </div>
      )}
      
      {/* 사용자 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">새 사용자 등록</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                <input
                  type="text"
                  required
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">역할</label>
                <select
                  required
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'user'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="user">일반 사용자</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  * 임시 비밀번호가 자동으로 생성됩니다. 사용자는 첫 로그인 후 비밀번호를 변경해야 합니다.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 사이트 관리 탭
function SiteManagementTab({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">사이트 관리</h2>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <p className="text-center text-gray-500 dark:text-gray-400">
          사이트 관리 기능이 개발 중입니다. 곧 제공될 예정입니다.
        </p>
        <div className="flex justify-center mt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            사이트 설정하기
          </button>
        </div>
      </div>
    </div>
  );
}

// 데이터 관리 탭
function DataManagementTab({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">데이터 관리</h2>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <p className="text-center text-gray-500 dark:text-gray-400">
          데이터 관리 기능이 개발 중입니다. 곧 제공될 예정입니다.
        </p>
        <div className="flex justify-center mt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            데이터 백업하기
          </button>
        </div>
      </div>
    </div>
  );
} 