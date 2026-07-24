// src/app/data-structure.interface.ts
// 데이터베이스의 상위 구조를 정의
export interface UserData {
    [category: string]: { [key: string]: { filename: string; }; };
}
