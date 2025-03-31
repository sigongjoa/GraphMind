// 노트 에디터 컴포넌트: NoteEditor.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../common/Header';
import Button from '../common/Button';
import Loader from '../common/Loader';

interface NoteEditorProps {
  username?: string;
  isEdit?: boolean;
}

interface Concept {
  id: number;
  name: string;
}

interface Note {
  id?: number;
  title: string;
  content: string;
  conceptId: number;
  createdAt?: string;
  updatedAt?: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ username = '사용자', isEdit = false }) => {
  const router = useRouter();
  const { conceptId, noteId } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [note, setNote] = useState<Note>({
    title: '',
    content: '',
    conceptId: Number(conceptId) || 0
  });
  
  useEffect(() => {
    if (!conceptId) return;

    // 실제 구현에서는 API에서 데이터를 가져옵니다
    const fetchData = async () => {
      try {
        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 샘플 데이터
        const conceptData: Concept = {
          id: Number(conceptId),
          name: '소프트웨어 공학'
        };
        
        setConcept(conceptData);
        
        if (isEdit && noteId) {
          // 기존 노트 데이터 가져오기
          const noteData: Note = {
            id: Number(noteId),
            title: '소프트웨어 공학 핵심 개념 정리',
            content: '# 소프트웨어 공학 핵심 개념\n\n## 정의\n소프트웨어 공학은 소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문입니다.\n\n## 주요 목표\n- 고품질의 소프트웨어를 비용 효율적으로 개발\n- 사용자 요구사항 충족\n- 유지보수 용이성 확보',
            conceptId: Number(conceptId),
            createdAt: '2025-03-30',
            updatedAt: '2025-03-30'
          };
          
          setNote(noteData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [conceptId, noteId, isEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNote(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!note.title.trim() || !note.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    setSaving(true);
    
    try {
      // 실제 구현에서는 API 호출하여 노트 저장
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 저장 성공 후 노트 상세 페이지로 이동
      router.push(`/concept/${conceptId}`);
    } catch (error) {
      console.error('노트 저장 실패:', error);
      alert('노트 저장에 실패했습니다. 다시 시도해주세요.');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header username={username} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader size="lg" text="데이터를 불러오는 중..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <a 
            href={`/concept/${conceptId}`}
            className="flex items-center text-primary hover:text-primary-dark"
          >
            <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            개념 상세로 돌아가기
          </a>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isEdit ? '노트 수정' : '새 노트 작성'}
        </h1>
        <p className="text-gray-600 mb-6">개념: {concept?.name}</p>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                제목
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={note.title}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="노트 제목을 입력하세요"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                내용 (마크다운 지원)
              </label>
              <textarea
                id="content"
                name="content"
                value={note.content}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                rows={15}
                placeholder="노트 내용을 입력하세요. 마크다운 문법을 지원합니다."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                취소
              </Button>
              <Button 
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader size="sm" color="white" className="mr-2" />
                    저장 중...
                  </>
                ) : (
                  '저장하기'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NoteEditor;
