export type StoreData<T> = {
  list: Array<T>;
  headers: Array<keyof T>;
  status: 'empty' | 'loading' | 'loaded' | 'error';
};
