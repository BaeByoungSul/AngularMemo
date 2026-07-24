export interface UserDataNode {
  name: string;
  value: any;
  children?: UserDataNode[];
  parent?: UserDataNode | null;
}

