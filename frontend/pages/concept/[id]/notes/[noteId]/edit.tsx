// 프론트엔드 노트 편집 페이지: concept/[id]/notes/[noteId]/edit.tsx
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import NoteEditor from '../../../../../components/notes/NoteEditor';

export default function EditNotePage() {
  const router = useRouter();
  const { id, noteId } = router.query;

  return (
    <div>
      <Head>
        <title>노트 편집 - 개념 그래프 학습 시스템</title>
        <meta name="description" content="개념에 대한 노트 편집하기" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NoteEditor isEdit={true} />
    </div>
  );
}
