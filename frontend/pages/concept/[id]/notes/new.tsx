// 프론트엔드 노트 에디터 페이지: concept/[id]/notes/new.tsx
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import NoteEditor from '../../../../components/notes/NoteEditor';

export default function NewNotePage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <Head>
        <title>새 노트 작성 - 개념 그래프 학습 시스템</title>
        <meta name="description" content="개념에 대한 새 노트 작성하기" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NoteEditor />
    </div>
  );
}
