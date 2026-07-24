export interface Note {
  id?: string; // Firestore 문서 ID (선택 사항)
  title: string;
  content: string;
  createdAt: any; // Firebase Server Timestamp 사용 권장
}