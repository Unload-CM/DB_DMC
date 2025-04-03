'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { InventoryItem } from '@/types';
import { FaBox, FaArrowDown, FaArrowUp, FaClipboardList, FaSearch, FaFilter } from 'react-icons/fa';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'in' | 'out' | 'list'>('list');
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState<{type: 'success' | 'error', message: string}>({
    type: 'success',
    message: ''
  });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  
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
            <FaBox className="mr-3 text-blue-500" /> 자재관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">자재 입고, 출고 및 목록을 관리합니다.</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <TabButton 
            isActive={activeTab === 'in'} 
            onClick={() => setActiveTab('in')}
            icon="📥"
            label="자재 입고 (IN)"
          />
          <TabButton 
            isActive={activeTab === 'out'} 
            onClick={() => setActiveTab('out')}
            icon="📤"
            label="자재 출고 (OUT)"
          />
          <TabButton 
            isActive={activeTab === 'list'} 
            onClick={() => setActiveTab('list')}
            icon="📋"
            label="자재 목록"
          />
        </div>
        
        <div className="p-6">
          {activeTab === 'in' && <InventoryInTab key={`in-${refreshFlag}`} onRefresh={refreshPage} />}
          {activeTab === 'out' && <InventoryOutTab key={`out-${refreshFlag}`} onRefresh={refreshPage} />}
          {activeTab === 'list' && <InventoryListTab key={`list-${refreshFlag}`} onRefresh={refreshPage} />}
        </div>
      </div>
      
      {/* 자재 상세 보기 모달 */}
      {showDetailModal && selectedItem && (
        <ItemDetailModal 
          itemId={selectedItem} 
          onClose={() => setShowDetailModal(false)} 
        />
      )}
      
      {/* 결과 모달 */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${
                resultMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {resultMessage.type === 'success' ? '작업 성공' : '작업 실패'}
              </h3>
              <button
                onClick={() => setShowResultModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={`p-4 rounded-lg mb-4 ${
              resultMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <p className={`${
                resultMessage.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {resultMessage.message}
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowResultModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 자재 수정 모달 */}
      {showEditModal && selectedItem && (
        <ItemEditModal 
          itemId={selectedItem} 
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedItem) => {
            setInventoryItems(inventoryItems.map(item => 
              item.id === updatedItem.id ? updatedItem : item
            ));
            setShowEditModal(false);
          }}
        />
      )}
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

function InventoryInTab({ onRefresh }: { onRefresh: () => void }) {
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    description: '',
    quantity: 0,
    unit_price: 0,
    category: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [itemType, setItemType] = useState<'IN' | 'OUT'>('IN');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'quantity' || name === 'unit_price' ? parseFloat(value) : value,
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'IN' | 'OUT';
    setItemType(type);
    
    // 타입에 따라 기본 수량 설정
    if (type === 'IN' && newItem.quantity !== undefined && newItem.quantity < 10) {
      setNewItem({...newItem, quantity: 10});
    } else if (type === 'OUT' && newItem.quantity !== undefined && newItem.quantity >= 10) {
      setNewItem({...newItem, quantity: 9});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // 타입에 따른 수량 검증
      let finalQuantity = newItem.quantity || 0;
      if (itemType === 'IN' && finalQuantity < 10) {
        finalQuantity = 10;
      } else if (itemType === 'OUT' && finalQuantity >= 10) {
        finalQuantity = 9;
      }

      const { data, error } = await supabase
        .from('inventory')
        .insert([
          {
            ...newItem,
            quantity: finalQuantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      console.log('자재 입고 성공:', data);

      setMessage({
        type: 'success',
        text: `자재가 성공적으로 ${itemType === 'IN' ? '입고' : '출고'}되었습니다.`,
      });
      setNewItem({
        name: '',
        description: '',
        quantity: 0,
        unit_price: 0,
        category: '',
      });
      setItemType('IN');
      
      // 부모 컴포넌트에 새로고침 신호 전달
      setTimeout(() => {
        onRefresh();
      }, 1500);
    } catch (error: any) {
      console.error('자재 입고 오류:', error);
      setMessage({
        type: 'error',
        text: error.message || '자재 등록 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">자재 {itemType === 'IN' ? '입고' : '출고'} 등록</h2>
      
      {message && (
        <div 
          className={`p-4 mb-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              자재명
            </label>
            <input
              type="text"
              name="name"
              value={newItem.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              구분
            </label>
            <select
              value={itemType}
              onChange={handleTypeChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="IN">입고 (IN)</option>
              <option value="OUT">출고 (OUT)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {itemType === 'IN' ? '수량이 10 이상으로 설정됩니다.' : '수량이 9 이하로 설정됩니다.'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <input
              type="text"
              name="category"
              value={newItem.category}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              수량
            </label>
            <input
              type="number"
              name="quantity"
              min={itemType === 'IN' ? 10 : 1}
              max={itemType === 'OUT' ? 9 : undefined}
              value={newItem.quantity}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              단가
            </label>
            <input
              type="number"
              name="unit_price"
              min="0"
              step="0.01"
              value={newItem.unit_price}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명
          </label>
          <textarea
            name="description"
            value={newItem.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 ${
              itemType === 'IN' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {isLoading ? '처리 중...' : `${itemType === 'IN' ? '입고' : '출고'} 등록`}
          </button>
        </div>
      </form>
    </div>
  );
}

function InventoryOutTab({ onRefresh }: { onRefresh: () => void }) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [outQuantity, setOutQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 자재 목록 로드 함수
  const fetchInventoryItems = async () => {
    try {
      setIsDataLoading(true);
      console.log('자재 목록 조회 시작 (출고 탭)');
      
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');

      if (error) {
        console.error('자재 목록 조회 오류:', error);
        throw error;
      }
      
      console.log('자재 목록 조회 성공:', data?.length || 0, '개의 항목');
      
      if (data) {
        setInventoryItems(data);
      }
    } catch (error) {
      console.error('자재 목록 로딩 오류:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  // 자재 목록 로드
  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!selectedItemId) {
      setMessage({ type: 'error', text: '자재를 선택해주세요.' });
      setIsLoading(false);
      return;
    }

    try {
      // 선택된 자재 정보 가져오기
      const { data: selectedItemData, error: selectError } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', selectedItemId)
        .single();
      
      if (selectError) {
        throw new Error('선택한 자재 정보를 가져오는데 실패했습니다. 새로고침 후 다시 시도해주세요.');
      }
      
      if (!selectedItemData) {
        throw new Error('선택한 자재 정보를 찾을 수 없습니다.');
      }
      
      if (selectedItemData.quantity < outQuantity) {
        throw new Error('출고 수량이 재고 수량보다 많습니다.');
      }

      // 자재 출고 처리 (수량 감소)
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ 
          quantity: selectedItemData.quantity - outQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedItemId);

      if (updateError) throw updateError;

      console.log('자재 출고 성공:', selectedItemId, '수량:', outQuantity);

      setMessage({
        type: 'success',
        text: '자재가 성공적으로 출고되었습니다.',
      });
      
      // 자재 목록 갱신
      await fetchInventoryItems();
      
      // 입력 필드 초기화
      setSelectedItemId('');
      setOutQuantity(1);
      
      // 부모 컴포넌트에 새로고침 신호 전달
      setTimeout(() => {
        onRefresh();
      }, 1500);
    } catch (error: any) {
      console.error('자재 출고 오류:', error);
      setMessage({
        type: 'error',
        text: error.message || '자재 출고 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">자재 출고 등록</h2>
      
      {message && (
        <div 
          className={`p-4 mb-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
      
      {isDataLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              출고할 자재
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">자재를 선택하세요</option>
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - 현재 재고: {item.quantity}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              출고 수량
            </label>
            <input
              type="number"
              min="1"
              value={outQuantity}
              onChange={(e) => setOutQuantity(parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !selectedItemId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? '처리 중...' : '출고 등록'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function InventoryListTab({ onRefresh }: { onRefresh: () => void }) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState<{type: 'success' | 'error', message: string}>({
    type: 'success',
    message: ''
  });
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 자재 목록 로드 함수
  const fetchInventoryItems = async () => {
    try {
      setIsLoading(true);
      console.log('자재 목록 조회 시작');
      
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');

      if (error) {
        console.error('자재 목록 조회 오류:', error);
        throw error;
      }
      
      console.log('자재 목록 조회 성공:', data?.length || 0, '개의 항목');
      
      if (data) {
        setInventoryItems(data);
        // 카테고리 목록 추출
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('자재 목록 로딩 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 자재 목록 최초 로드
  useEffect(() => {
    fetchInventoryItems();
  }, []);

  // 필터링된 자재 목록
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // 삭제 처리
  const handleDeleteItem = async (id: string) => {
    try {
      setIsDeleting(true);
      console.log('자재 삭제 시작:', id);
      
      // 삭제 전 다시 한번 확인을 위해 해당 항목이 존재하는지 확인
      const { data: checkData, error: checkError } = await supabase
        .from('inventory')
        .select('id, name')
        .eq('id', id)
        .single();
      
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.log('삭제할 항목이 이미 존재하지 않습니다:', id);
          setResultMessage({
            type: 'error',
            message: '삭제할 항목이 이미 존재하지 않습니다. 페이지를 새로고침합니다.'
          });
          setShowResultModal(true);
          await fetchInventoryItems(); // 목록 다시 불러오기
          setShowDeleteModal(false);
          return;
        }
        throw checkError;
      }
      
      // 실제 삭제 수행 - RPC 호출로 강제 삭제
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('삭제 중 오류 발생:', error);
        throw error;
      }
      
      // 삭제 후 확인을 위해 아이템이 정말 삭제되었는지 체크
      const { data: verifyData, error: verifyError } = await supabase
        .from('inventory')
        .select('id')
        .eq('id', id);
        
      if (verifyError) {
        console.error('삭제 확인 중 오류 발생:', verifyError);
      }
      
      // 항목이 여전히 존재하는지 확인
      if (verifyData && verifyData.length > 0) {
        console.error('삭제 실패: 항목이 여전히 존재합니다', id);
        setResultMessage({
          type: 'error',
          message: '삭제가 완료되지 않았습니다. 다시 시도해주세요.'
        });
        setShowResultModal(true);
        return;
      }
      
      console.log('자재 삭제 성공:', id);

      // 목록 다시 불러오기
      await fetchInventoryItems();
      
      // 삭제 성공 모달 표시
      setResultMessage({
        type: 'success',
        message: '자재가 성공적으로 삭제되었습니다.'
      });
      
      // 모달 전환 (삭제 확인 모달 닫고 결과 모달 열기)
      setShowDeleteModal(false);
      setShowResultModal(true);
      
      // 부모 컴포넌트에 새로고침 신호 전달
      setTimeout(() => {
        onRefresh();
      }, 1000);
    } catch (error: any) {
      console.error('자재 삭제 오류:', error);
      setResultMessage({
        type: 'error',
        message: `자재 삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`
      });
      setShowResultModal(true);
    } finally {
      setIsDeleting(false);
    }
  };

  // 삭제 모달 열기
  const openDeleteModal = (id: string) => {
    const item = inventoryItems.find(item => item.id === id);
    if (item) {
      setDeleteItemId(id);
      setDeleteItemName(item.name);
      setShowDeleteModal(true);
    }
  };

  // 상세 보기 처리
  const handleViewDetail = (id: string) => {
    setSelectedItem(id);
    setShowDetailModal(true);
  };

  // 수정 처리
  const handleEdit = (id: string) => {
    setSelectedItem(id);
    setShowEditModal(true);
  };

  // 자재 유형 결정 (임시 로직: 수량에 따라 결정)
  const getItemType = (item: InventoryItem) => {
    // 실제로는 데이터베이스에서 구분 정보를 가져와야 하며
    // 수량이 10 이상이면 IN, 미만이면 OUT으로 표시
    return item.quantity >= 10 ? 'IN' : 'OUT';
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="자재명 또는 설명으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div className="w-full md:w-64 relative">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 appearance-none rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">모든 카테고리</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="fill-current h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full animate-ping opacity-75"></div>
            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-300">자재명</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-300">구분</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-300">카테고리</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-300">수량</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-300">단가</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-300">총액</th>
                <th className="px-4 py-3 text-gray-700 dark:text-gray-300 text-center">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.map((item) => (
                <tr key={item.id} className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition duration-150">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {item.name}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      getItemType(item) === 'IN' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {getItemType(item)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.quantity <= 5 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.unit_price.toLocaleString()}원</td>
                  <td className="px-4 py-3 text-gray-900 font-medium dark:text-white">{(item.quantity * item.unit_price).toLocaleString()}원</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(item.id)}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        상세
                      </button>
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="px-2 py-1 text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => openDeleteModal(item.id)}
                        className="px-2 py-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FaBox className="mx-auto text-gray-300 dark:text-gray-600" size={48} />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            {searchTerm || categoryFilter ? '검색 결과가 없습니다.' : '등록된 자재가 없습니다.'}
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            자재 추가하기
          </button>
        </div>
      )}
      
      {/* 삭제 확인 모달 */}
      {showDeleteModal && deleteItemId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">자재 삭제 확인</h3>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              <span className="font-medium text-red-600 dark:text-red-400">{deleteItemName}</span> 자재를 데이터베이스에서 영구적으로 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItemId(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteItem(deleteItemId)}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 자재 상세 보기 모달 컴포넌트
function ItemDetailModal({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('id', itemId)
          .single();
          
        if (error) throw error;
        setItem(data);
      } catch (error) {
        console.error('자재 상세 정보 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemDetails();
  }, [itemId]);
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">자재 상세 정보</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : item ? (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300">{item.name}</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{item.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">카테고리</p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">수량</p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">단가</p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.unit_price.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">총액</p>
                  <p className="font-medium text-gray-900 dark:text-white">{(item.quantity * item.unit_price).toLocaleString()}원</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">등록일</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(item.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">최종 수정일</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(item.updated_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">자재 정보를 찾을 수 없습니다.</p>
          )}
        </div>
        
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// 자재 수정 모달 컴포넌트
function ItemEditModal({ 
  itemId, 
  onClose,
  onUpdate
}: { 
  itemId: string; 
  onClose: () => void;
  onUpdate: (item: InventoryItem) => void;
}) {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: 0,
    unit_price: 0,
    type: 'IN',
  });
  const [error, setError] = useState<string | null>(null);
  
  // 자재 유형 결정 (임시 로직에서 수정)
  const getItemType = (item: InventoryItem) => {
    // 실제로는 데이터베이스에서 구분 정보를 가져와야 함
    // 여기서는 단순히 수량이 10 이상이면 IN, 미만이면 OUT으로 표시
    return item.quantity >= 10 ? 'IN' : 'OUT';
  };
  
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('id', itemId)
          .single();
          
        if (error) throw error;
        setItem(data);
        setFormData({
          name: data.name,
          description: data.description || '',
          category: data.category,
          quantity: data.quantity,
          unit_price: data.unit_price,
          type: getItemType(data),
        });
      } catch (error) {
        console.error('자재 상세 정보 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemDetails();
  }, [itemId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' || name === 'unit_price' ? parseFloat(value) : value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    
    try {
      if (!item) throw new Error('자재 정보를 찾을 수 없습니다.');
      
      // 구분이 OUT이고 수량이 10 이상이면 자동으로 IN으로 변경
      // 구분이 IN이고 수량이 10 미만이면 자동으로 OUT으로 변경
      let updatedQuantity = formData.quantity;
      if (formData.type === 'OUT' && updatedQuantity >= 10) {
        updatedQuantity = 9; // OUT이면 수량을 9 이하로 조정
      } else if (formData.type === 'IN' && updatedQuantity < 10) {
        updatedQuantity = 10; // IN이면 수량을 10 이상으로 조정
      }
      
      const updatedItem = {
        ...item,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        quantity: updatedQuantity,
        unit_price: formData.unit_price,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('inventory')
        .update(updatedItem)
        .eq('id', item.id);
        
      if (error) throw error;
      
      console.log('자재 수정 성공:', updatedItem);
      
      // 업데이트된 정보 다시 가져오기
      const { data: refreshedData, error: refreshError } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', item.id)
        .single();
        
      if (refreshError) {
        console.warn('업데이트된 자재 정보를 다시 불러오는데 실패했습니다:', refreshError);
        onUpdate(updatedItem); // 기존 객체로 업데이트
      } else {
        console.log('최신 자재 정보 조회 성공:', refreshedData);
        onUpdate(refreshedData); // 최신 데이터로 업데이트
      }
    } catch (error: any) {
      console.error('자재 수정 오류:', error);
      setError(error.message || '자재 정보 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">자재 정보 수정</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : item ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  자재명
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    구분
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="IN">입고 (IN)</option>
                    <option value="OUT">출고 (OUT)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.type === 'IN' ? '수량이 10 이상으로 설정됩니다.' : '수량이 9 이하로 설정됩니다.'}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    카테고리
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    수량
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    단가
                  </label>
                  <input
                    type="number"
                    id="unit_price"
                    name="unit_price"
                    value={formData.unit_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  disabled={saving}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">자재 정보를 찾을 수 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
} 