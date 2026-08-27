import NextAuth, { type DefaultSession, type DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      organization_id?: string | null;
      document_cnpj_cpf?: string | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: string;
    organization_id?: string | null;
    document_cnpj_cpf?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    organization_id?: string | null;
    document_cnpj_cpf?: string | null;
  }
}
