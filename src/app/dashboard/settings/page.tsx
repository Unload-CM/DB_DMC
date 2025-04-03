'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FaCog, FaSortAmountUp, FaExchangeAlt, FaUsers } from 'react-icons/fa';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'priority' | 'status' | 'employee'>('priority');
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
            <FaCog className="mr-3 text-blue-500" /> 설정
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">시스템 설정 및 기준정보를 관리합니다.</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <TabButton 
            isActive={activeTab === 'priority'} 
            onClick={() => setActiveTab('priority')}
            icon="🔢"
            label="우선순위 관리"
          />
          <TabButton 
            isActive={activeTab === 'status'} 
            onClick={() => setActiveTab('status')}
            icon="🔄"
            label="상태 관리"
          />
          <TabButton 
            isActive={activeTab === 'employee'} 
            onClick={() => setActiveTab('employee')}
            icon="👨‍💼"
            label="직원 관리"
          />
        </div>
        
        <div className="p-6">
          {activeTab === 'priority' && <PriorityManagementTab key={`priority-${refreshFlag}`} onRefresh={refreshPage} />}
          {activeTab === 'status' && <StatusManagementTab key={`status-${refreshFlag}`} onRefresh={refreshPage} />}
          {activeTab === 'employee' && <EmployeeManagementTab key={`employee-${refreshFlag}`} onRefresh={refreshPage} />}
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

// 우선순위 관리 탭
function PriorityManagementTab({ onRefresh }: { onRefresh: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPriority, setNewPriority] = useState({
    name: '',
    description: '',
    priority_level: 1,
    color: '#3B82F6'
  });
  
  useEffect(() => {
    fetchPriorities();
  }, []);
  
  const fetchPriorities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('priorities')
        .select('*')
        .order('priority_level', { ascending: true });
          
      if (error) throw error;
      setPriorities(data || []);
    } catch (error: any) {
      console.error('우선순위 목록 로딩 오류:', error.message || error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddPriority = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('priorities')
        .insert([
          {
            ...newPriority,
            created_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) throw error;
      
      // 새로운 우선순위 추가 후 목록 새로고침
      onRefresh();
      fetchPriorities();
      setShowAddModal(false);
      setNewPriority({
        name: '',
        description: '',
        priority_level: 1,
        color: '#3B82F6'
      });
      
    } catch (error: any) {
      console.error('우선순위 추가 오류:', error.message || error);
      alert('우선순위 추가 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeletePriority = async (id: string) => {
    if (!confirm('이 우선순위를 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('priorities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // 목록 새로고침
      fetchPriorities();
    } catch (error) {
      console.error('우선순위 삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-lg font-semibold">우선순위 관리</h2>
        
        <div className="flex mt-4 md:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <span className="mr-1">+</span> 우선순위 추가
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
      ) : priorities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">우선순위</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">이름</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">설명</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">색상</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {priorities.map((priority) => (
                <tr key={priority.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">{priority.priority_level}</td>
                  <td className="px-4 py-3">{priority.name}</td>
                  <td className="px-4 py-3">{priority.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded-full mr-2" 
                        style={{ backgroundColor: priority.color }}
                      ></div>
                      {priority.color}
                    </div>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleDeletePriority(priority.id)}
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
          <p className="text-gray-500 dark:text-gray-400 mb-4">등록된 우선순위가 없습니다.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새 우선순위 설정하기
          </button>
        </div>
      )}
      
      {/* 우선순위 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">새 우선순위 등록</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddPriority}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                <input
                  type="text"
                  required
                  value={newPriority.name}
                  onChange={(e) => setNewPriority({...newPriority, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">설명</label>
                <textarea
                  rows={3}
                  value={newPriority.description}
                  onChange={(e) => setNewPriority({...newPriority, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">우선순위 레벨</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={newPriority.priority_level}
                  onChange={(e) => setNewPriority({...newPriority, priority_level: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">색상</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={newPriority.color}
                    onChange={(e) => setNewPriority({...newPriority, color: e.target.value})}
                    className="h-10 w-10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newPriority.color}
                    onChange={(e) => setNewPriority({...newPriority, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
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

// 상태 관리 탭
function StatusManagementTab({ onRefresh }: { onRefresh: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newStatus, setNewStatus] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    order_index: 1,
    category: 'general',
    is_default: false
  });
  
  const categories = [
    { id: 'all', name: '전체' },
    { id: 'general', name: '일반' },
    { id: 'production', name: '생산' },
    { id: 'purchase', name: '구매' },
    { id: 'shipping', name: '출하' }
  ];
  
  useEffect(() => {
    fetchStatuses();
  }, []);
  
  const fetchStatuses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('task_statuses')
        .select('*')
        .order('category')
        .order('order_index', { ascending: true });
          
      if (error) throw error;
      setStatuses(data || []);
    } catch (error: any) {
      console.error('상태 목록 로딩 오류:', error.message || error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // 현재 로그인한 사용자의 ID 가져오기
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId) {
        alert('로그인이 필요합니다.');
        return;
      }
      
      const { data, error } = await supabase
        .from('task_statuses')
        .insert([
          {
            ...newStatus,
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) throw error;
      
      // 새로운 상태 추가 후 목록 새로고침
      onRefresh();
      fetchStatuses();
      setShowAddModal(false);
      setNewStatus({
        name: '',
        description: '',
        color: '#3B82F6',
        order_index: 1,
        category: 'general',
        is_default: false
      });
      
    } catch (error: any) {
      console.error('상태 추가 오류:', error.message || error);
      alert('상태 추가 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteStatus = async (id: string) => {
    if (!confirm('이 상태를 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('task_statuses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // 목록 새로고침
      fetchStatuses();
    } catch (error) {
      console.error('상태 삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };
  
  // 선택된 카테고리에 따라 필터링
  const filteredStatuses = selectedCategory === 'all' 
    ? statuses 
    : statuses.filter(status => status.category === selectedCategory);
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-lg font-semibold">상태 관리</h2>
        
        <div className="flex mt-4 md:mt-0 space-x-2">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <span className="mr-1">+</span> 상태 추가
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
      ) : filteredStatuses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">이름</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">설명</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">카테고리</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">표시 순서</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">색상</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">기본값</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredStatuses.map((status) => (
                <tr key={status.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">{status.name}</td>
                  <td className="px-4 py-3">{status.description}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${status.category === 'general' ? 'bg-gray-100 text-gray-800' : 
                        status.category === 'production' ? 'bg-blue-100 text-blue-800' : 
                        status.category === 'purchase' ? 'bg-purple-100 text-purple-800' : 
                        'bg-green-100 text-green-800'}`}
                    >
                      {status.category === 'general' ? '일반' : 
                       status.category === 'production' ? '생산' : 
                       status.category === 'purchase' ? '구매' : '출하'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{status.order_index}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded-full mr-2" 
                        style={{ backgroundColor: status.color }}
                      ></div>
                      {status.color}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {status.is_default ? 
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">기본값</span> : 
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">일반</span>
                    }
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleDeleteStatus(status.id)}
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
          <p className="text-gray-500 dark:text-gray-400 mb-4">등록된 상태가 없습니다.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새 상태 설정하기
          </button>
        </div>
      )}
      
      {/* 상태 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">새 상태 등록</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddStatus}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                <input
                  type="text"
                  required
                  value={newStatus.name}
                  onChange={(e) => setNewStatus({...newStatus, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">설명</label>
                <textarea
                  rows={3}
                  value={newStatus.description}
                  onChange={(e) => setNewStatus({...newStatus, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">카테고리</label>
                <select
                  required
                  value={newStatus.category}
                  onChange={(e) => setNewStatus({...newStatus, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="general">일반</option>
                  <option value="production">생산</option>
                  <option value="purchase">구매</option>
                  <option value="shipping">출하</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">표시 순서</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={newStatus.order_index}
                  onChange={(e) => setNewStatus({...newStatus, order_index: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">색상</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={newStatus.color}
                    onChange={(e) => setNewStatus({...newStatus, color: e.target.value})}
                    className="h-10 w-10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newStatus.color}
                    onChange={(e) => setNewStatus({...newStatus, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={newStatus.is_default}
                    onChange={(e) => setNewStatus({...newStatus, is_default: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    이 상태를 카테고리의 기본값으로 설정
                  </label>
                </div>
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

// 직원 관리 탭
function EmployeeManagementTab({ onRefresh }: { onRefresh: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    full_name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    hire_date: '',
    status: 'active',
    manager_id: null as string | null
  });
  const [managers, setManagers] = useState<any[]>([]);
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*, manager:employees(full_name)')
        .order('department')
        .order('full_name');
          
      if (error) throw error;
      setEmployees(data || []);
      
      // 매니저 목록 구성 (직위 기준으로 필터링)
      const potentialManagers = data?.filter(emp => 
        emp.position.includes('팀장') || 
        emp.position.includes('매니저') || 
        emp.position.includes('관리자') ||
        emp.position.includes('과장') ||
        emp.position.includes('부장') ||
        emp.position.includes('이사') ||
        emp.position.includes('대표')
      ) || [];
      
      setManagers(potentialManagers);
    } catch (error: any) {
      console.error('직원 목록 로딩 오류:', error.message || error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // 현재 로그인한 사용자의 ID 가져오기
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId) {
        alert('로그인이 필요합니다.');
        return;
      }
      
      const { data, error } = await supabase
        .from('employees')
        .insert([
          {
            ...newEmployee,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) throw error;
      
      // 새로운 직원 추가 후 목록 새로고침
      onRefresh();
      fetchEmployees();
      setShowAddModal(false);
      setNewEmployee({
        employee_id: '',
        full_name: '',
        position: '',
        department: '',
        email: '',
        phone: '',
        hire_date: '',
        status: 'active',
        manager_id: null
      });
      
    } catch (error: any) {
      console.error('직원 추가 오류:', error.message || error);
      alert('직원 추가 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('이 직원을 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // 목록 새로고침
      fetchEmployees();
    } catch (error) {
      console.error('직원 삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };
  
  const handleUpdateStatus = async (id: string, newStatus: 'active' | 'leave' | 'terminated') => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // 목록 새로고침
      fetchEmployees();
    } catch (error) {
      console.error('직원 상태 업데이트 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };
  
  // 검색어에 따른 필터링
  const filteredEmployees = employees.filter(employee => 
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 부서 목록 (중복 제거)
  const departments = [...new Set(employees.map(emp => emp.department))];
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-lg font-semibold">직원 관리</h2>
        
        <div className="flex mt-4 md:mt-0 space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <span className="mr-1">+</span> 직원 등록
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
      ) : filteredEmployees.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">사원번호</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">이름</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">부서</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">직위</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">이메일</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">연락처</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">입사일</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">관리자</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">상태</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">{employee.employee_id}</td>
                  <td className="px-4 py-3">{employee.full_name}</td>
                  <td className="px-4 py-3">{employee.department}</td>
                  <td className="px-4 py-3">{employee.position}</td>
                  <td className="px-4 py-3">{employee.email}</td>
                  <td className="px-4 py-3">{employee.phone}</td>
                  <td className="px-4 py-3">{new Date(employee.hire_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{employee.manager?.full_name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.status === 'active' ? 'bg-green-100 text-green-800' :
                      employee.status === 'leave' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {employee.status === 'active' ? '재직중' :
                       employee.status === 'leave' ? '휴직중' : '퇴사'}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleUpdateStatus(employee.id, 'active')}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                      disabled={employee.status === 'active'}
                    >
                      재직
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(employee.id, 'leave')}
                      className="px-2 py-1 text-xs bg-yellow-500 text-white rounded"
                      disabled={employee.status === 'leave'}
                    >
                      휴직
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(employee.id, 'terminated')}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                      disabled={employee.status === 'terminated'}
                    >
                      퇴사
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded ml-2"
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
          <p className="text-gray-500 dark:text-gray-400 mb-4">등록된 직원이 없습니다.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            직원 등록하기
          </button>
        </div>
      )}
      
      {/* 직원 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">새 직원 등록</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">사원번호</label>
                <input
                  type="text"
                  required
                  value={newEmployee.employee_id}
                  onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="예: EMP-2024-001"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                <input
                  type="text"
                  required
                  value={newEmployee.full_name}
                  onChange={(e) => setNewEmployee({...newEmployee, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">부서</label>
                  <select
                    required
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">부서 선택</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    <option value="경영지원">경영지원</option>
                    <option value="인사">인사</option>
                    <option value="재무/회계">재무/회계</option>
                    <option value="영업">영업</option>
                    <option value="마케팅">마케팅</option>
                    <option value="생산">생산</option>
                    <option value="품질관리">품질관리</option>
                    <option value="연구개발">연구개발</option>
                    <option value="구매">구매</option>
                    <option value="물류">물류</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">직위</label>
                  <select
                    required
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">직위 선택</option>
                    <option value="사원">사원</option>
                    <option value="주임">주임</option>
                    <option value="대리">대리</option>
                    <option value="과장">과장</option>
                    <option value="차장">차장</option>
                    <option value="부장">부장</option>
                    <option value="이사">이사</option>
                    <option value="상무">상무</option>
                    <option value="전무">전무</option>
                    <option value="사장">사장</option>
                    <option value="대표이사">대표이사</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
                <input
                  type="email"
                  required
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">연락처</label>
                <input
                  type="tel"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="예: 010-1234-5678"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">입사일</label>
                <input
                  type="date"
                  required
                  value={newEmployee.hire_date}
                  onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">관리자</label>
                <select
                  value={newEmployee.manager_id || ''}
                  onChange={(e) => setNewEmployee({...newEmployee, manager_id: e.target.value || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">관리자 없음</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>{manager.full_name} ({manager.position}, {manager.department})</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">상태</label>
                <select
                  value={newEmployee.status}
                  onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value as 'active' | 'leave' | 'terminated'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="active">재직중</option>
                  <option value="leave">휴직중</option>
                  <option value="terminated">퇴사</option>
                </select>
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