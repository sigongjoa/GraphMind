import React, { useState } from 'react';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import { useRouter } from 'next/router';
import { notesApi } from '../../api/client';

const NoteEditor: React.FC<{ isEdit?: boolean }> = ({ isEdit = false }) => {
  const router = useRouter();
  const { id, noteId } = router.query;
  const conceptId = typeof id === 'string' ? parseInt(id, 10) : undefined;
  const noteIdNum = typeof noteId === 'string' ? parseInt(noteId, 10) : undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 실제 구현에서는 useEffect로 노트 데이터 가져오기
  // useEffect(() => {
  //   if (isEdit && noteIdNum) {
  //     const fetchNote = async () => {
  //       try {
  //         const note = await notesApi.getById(noteIdNum);
  //         setTitle(note.title);
  //         setContent(note.content);
  //       } catch (err) {
  //         setError('노트를 불러오는 중 오류가 발생했습니다.');
  //       }
  //     };
  //     fetchNote();
  //   }
  // }, [isEdit, noteIdNum]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !conceptId) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isEdit && noteIdNum) {
        await notesApi.update(noteIdNum, { title, content });
      } else {
        await notesApi.create({ concept_id: conceptId, title, content });
      }
      
      router.push(`/concept/${conceptId}`);
    } catch (err) {
      console.error('노트 저장 중 오류 발생:', err);
      setError('노트를 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{isEdit ? '노트 편집' : '새 노트 작성'}</h1>
          <Button 
            variant="outline"
            onClick={() => router.push(`/concept/${conceptId}`)}
          >
            취소
          </Button>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                제목
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="노트 제목을 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                내용 (마크다운 지원)
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-64"
                placeholder="노트 내용을 입력하세요. 마크다운 문법을 사용할 수 있습니다."
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" isLoading={isLoading}>
                {isEdit ? '수정하기' : '저장하기'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default NoteEditor;
