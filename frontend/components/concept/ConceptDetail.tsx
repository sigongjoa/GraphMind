// 개념 상세 컴포넌트: ConceptDetail.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';

interface ConceptDetailProps {
  username?: string;
}

interface Concept {
  id: number;
  name: string;
  description: string;
}

interface RelatedConcept {
  id: number;
  name: string;
  relation: string;
}

interface LearningCard {
  id: number;
  question: string;
  answer: string;
  explanation?: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const ConceptDetail: React.FC<ConceptDetailProps> = ({ username = '사용자' }) => {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [relatedConcepts, setRelatedConcepts] = useState<RelatedConcept[]>([]);
  const [cards, setCards] = useState<LearningCard[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (!id) return;

    // 실제 구현에서는 API에서 데이터를 가져옵니다
    const fetchConceptData = async () => {
      try {
        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 샘플 데이터
        const conceptData: Concept = {
          id: Number(id),
          name: '소프트웨어 공학',
          description: '소프트웨어 공학은 소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문입니다. 고품질의 소프트웨어를 비용 효율적으로 개발하는 것을 목표로 합니다.'
        };
        
        const relatedConceptsData: RelatedConcept[] = [
          { id: 2, name: '요구사항 분석', relation: '하위 개념' },
          { id: 3, name: '유지보수', relation: '하위 개념' },
          { id: 4, name: '소프트웨어 테스팅', relation: '하위 개념' },
          { id: 5, name: '소프트웨어 설계', relation: '하위 개념' }
        ];
        
        const cardsData: LearningCard[] = [
          {
            id: 1,
            question: '소프트웨어 공학의 주요 목표는 무엇인가?',
            answer: '고품질의 소프트웨어를 비용 효율적으로 개발하는 것',
            explanation: '소프트웨어 공학은 체계적이고 규율적인 접근 방식을 통해 신뢰성 있고 효율적인 소프트웨어를 개발하는 것을 목표로 합니다.'
          },
          {
            id: 2,
            question: '소프트웨어 개발 생명주기(SDLC)의 주요 단계를 나열하시오.',
            answer: '요구사항 분석, 설계, 구현, 테스트, 배포, 유지보수',
            explanation: '소프트웨어 개발 생명주기는 소프트웨어 개발 과정을 체계적으로 관리하기 위한 프레임워크입니다. 각 단계는 특정 활동과 산출물을 포함합니다.'
          }
        ];
        
        const notesData: Note[] = [
          {
            id: 1,
            title: '소프트웨어 공학 핵심 개념 정리',
            content: '# 소프트웨어 공학 핵심 개념\n\n## 정의\n소프트웨어 공학은 소프트웨어의 개발, 운용, 유지보수 등의 생명 주기 전반을 체계적이고 서술적이며 정량적으로 다루는 학문입니다.\n\n## 주요 목표\n- 고품질의 소프트웨어를 비용 효율적으로 개발\n- 사용자 요구사항 충족\n- 유지보수 용이성 확보',
            createdAt: '2025-03-30'
          }
        ];
        
        setConcept(conceptData);
        setRelatedConcepts(relatedConceptsData);
        setCards(cardsData);
        setNotes(notesData);
        setLoading(false);
      } catch (error) {
        console.error('개념 데이터 로딩 실패:', error);
        setLoading(false);
      }
    };

    fetchConceptData();
  }, [id]);

  if (loading || !concept) {
    return (
      <div className="min-h-screen bg-background">
        <Header username={username} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader size="lg" text="개념 데이터를 불러오는 중..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/graph">
            <a className="flex items-center text-primary hover:text-primary-dark">
              <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              그래프로 돌아가기
            </a>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-800">개념: {concept.name}</h1>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                편집
              </Button>
              <Button variant="outline" size="sm" className="text-error hover:bg-error hover:text-white">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                삭제
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-2">설명:</h2>
            <p className="text-gray-700">{concept.description}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-3">관련 개념:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedConcepts.map((related) => (
                <Link key={related.id} href={`/concept/${related.id}`}>
                  <a>
                    <Card hoverable className="h-full">
                      <div className="flex flex-col h-full">
                        <h3 className="text-md font-medium text-gray-800 mb-1">{related.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">[관계: {related.relation}]</p>
                        <Button size="sm" variant="text" className="mt-auto">이동</Button>
                      </div>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium text-gray-800">학습 카드:</h2>
              <Button size="sm" variant="outline">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                새 카드 추가
              </Button>
            </div>
            
            {cards.map((card) => (
              <div key={card.id} className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="mb-2">
                  <span className="font-medium text-gray-800">Q: </span>
                  <span className="text-gray-700">{card.question}</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-800">A: </span>
                  <span className="text-gray-700">{card.answer}</span>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="text">상세보기</Button>
                  <Button size="sm" variant="text">편집</Button>
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium text-gray-800">내 노트:</h2>
              <Link href={`/concept/${concept.id}/notes/new`}>
                <a>
                  <Button size="sm" variant="outline">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    새 노트 작성
                  </Button>
                </a>
              </Link>
            </div>
            
            {notes.map((note) => (
              <div key={note.id} className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="mb-2">
                  <h3 className="font-medium text-gray-800">{note.title}</h3>
                  <p className="text-xs text-gray-500">작성일: {note.createdAt}</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Link href={`/concept/${concept.id}/notes/${note.id}`}>
                    <a>
                      <Button size="sm" variant="text">상세보기</Button>
                    </a>
                  </Link>
                  <Link href={`/concept/${concept.id}/notes/${note.id}/edit`}>
                    <a>
                      <Button size="sm" variant="text">편집</Button>
                    </a>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Link href={`/learning/${concept.id}`}>
            <a>
              <Button>학습하기</Button>
            </a>
          </Link>
          
          <Link href={`/review?concept=${concept.id}`}>
            <a>
              <Button variant="outline">복습하기</Button>
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ConceptDetail;
