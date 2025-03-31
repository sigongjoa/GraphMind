import React from 'react';
import ConceptInfo from './ConceptInfo';
import RelatedConcepts from './RelatedConcepts';
import ConceptCards from './ConceptCards';
import ConceptNotes from './ConceptNotes';

const ConceptDetail: React.FC<{ concept: any }> = ({ concept }) => {
  return (
    <div className="space-y-8">
      <ConceptInfo concept={concept} />
      <RelatedConcepts relatedConcepts={concept.related_concepts} />
      <ConceptCards cards={concept.cards} />
      <ConceptNotes notes={concept.notes} />
    </div>
  );
};

export default ConceptDetail;
