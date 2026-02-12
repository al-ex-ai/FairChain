declare module 'crypto-js' {
  export interface WordArray {
    toString(encoder?: any): string;
  }

  export interface CipherParams {
    toString(): string;
  }

  export namespace AES {
    function encrypt(message: string | WordArray, key: string | WordArray): CipherParams;
    function decrypt(encryptedData: string | CipherParams, key: string | WordArray): WordArray;
  }

  export namespace enc {
    const Utf8: {
      parse(str: string): WordArray;
      stringify(wordArray: WordArray): string;
    };
  }

  export default {
    AES,
    enc
  };
} 