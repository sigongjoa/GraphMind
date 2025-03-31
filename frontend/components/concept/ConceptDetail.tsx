import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ErrorBoundary from '../common/ErrorBoundary';
import { conceptsApi, notesApi } from '../../api/client';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';

const ConceptDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const conceptId = typeof id === 'string' ? parseInt(id, 10) : undefined;

  const [isLoading, setIsLoading] = useState(true);
  const [concept, setConcept] = useState<any>(null);
  const [relatedConcepts, setRelatedConcepts] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!conceptId) return;

    const fetchConceptData = async () => {
      try {
        setIsLoading(true);
        
        // 개념 상세 정보 가져오기
        const conceptData = await conceptsApi.getById(conceptId);
        setConcept(conceptData);
        
        // 관련 개념 설정
        setRelatedConcepts(conceptData.related_concepts || []);
        
        // 노트 가져오기
        const notesData = await notesApi.getAll(conceptId);
        setNotes(notesData);
        
        // 카드 가져오기 (실제 구현에서는 cardsApi.getAll(conceptId) 사용)
        setCards([]);
        
        setError(null);
      } catch (err) {
        console.error('개념 상세 정보 로딩 중 오류 발생:', err);
        setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchConceptData();
  }, [conceptId]);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-medium text-red-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-sm text-red-700">{error.message}</p>
            <Button 
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              새로고침
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{concept?.name}</h1>
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/learning/${conceptId}`)}
                >
                  학습하기
                </Button>
                <Button 
                  onClick={() => router.push(`/concept/${conceptId}/notes/new`)}
                >
                  노트 작성
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="mb-6">
                  <h2 className="text-lg font-medium mb-2">개념 설명</h2>
                  <div className="prose max-w-none">
                    <ReactMarkdown>{concept?.description || ''}</ReactMarkdown>
                  </div>
                </Card>
                
                <ErrorBoundary>
                  <Card className="mb-6" title="학습 카드">
                    {cards.length > 0 ? (
                      <div className="space-y-4">
                        {cards.map((card) => (
                          <div key={card.id} className="border border-gray-200 rounded-md p-4">
                            <p className="font-medium mb-2">{card.question}</p>
                            <div className="text-sm text-gray-600">
                              <p>정답: {card.answer}</p>
                              {card.explanation && <p className="mt-1">해설: {card.explanation}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">아직 학습 카드가 없습니다.</p>
                    )}
                  </Card>
                </ErrorBoundary>
                
                <ErrorBoundary>
                  <Card title="노트">
                    {notes.length > 0 ? (
                      <div className="space-y-4">
                        {notes.map((note) => (
                          <div key={note.id} className="border border-gray-200 rounded-md p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium">{note.title}</h3>
                              <Button 
                                variant="text" 
                                size="sm"
                                onClick={() => router.push(`/concept/${conceptId}/notes/${note.id}/edit`)}
                              >
                                편집
                              </Button>
                            </div>
                            <div className="prose max-w-none text-sm">
                              <ReactMarkdown>{note.content}</ReactMarkdown>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(note.created_at).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-600 mb-4">아직 노트가 없습니다.</p>
                        <Button 
                          variant="outline"
                          onClick={() => router.push(`/concept/${conceptId}/notes/new`)}
                        >
                          노트 작성하기
                        </Button>
                      </div>
                    )}
                  </Card>
                </ErrorBoundary>
              </div>
              
              <div>
                <Card title="관련 개념" className="mb-6">
                  {relatedConcepts.length > 0 ? (
                    <ul className="space-y-2">
                      {relatedConcepts.map((relatedConcept) => (
                        <li 
                          key={relatedConcept.id} 
                          className="border-l-4 border-primary pl-3 py-1 cursor-pointer hover:bg-gray-50"
                          onClick={() => router.push(`/concept/${relatedConcept.id}`)}
                        >
                          <p className="font-medium">{relatedConcept.name}</p>
                          <p className="text-xs text-gray-600">{relatedConcept.relation}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">관련 개념이 없습니다.</p>
                  )}
                </Card>
                
                <Card title="학습 이력">
                  <p className="text-gray-500">아직 학습 이력이 없습니다.</p>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ConceptDetail;
