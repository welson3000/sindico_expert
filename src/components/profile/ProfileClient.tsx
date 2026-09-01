'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, FileText, Building2, ShieldCheck, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { updateUserProfile } from '@/services/user.service';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  document_cnpj_cpf: string;
  created_at: Date | null;
  organizationName: string;
  organizationDocument: string;
}

export function ProfileClient({ profile }: { profile: ProfileData }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [documentCnpjCpf, setDocumentCnpjCpf] = useState(profile.document_cnpj_cpf);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await updateUserProfile(profile.id, {
        name,
        phone,
        document_cnpj_cpf: documentCnpjCpf,
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      } else {
        setMessage({ type: 'error', text: res.error || 'Erro ao atualizar perfil.' });
      }
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN_SINDICO':
        return 'Síndico / Gestor';
      case 'ADMIN_ADM':
        return 'Administrador do Sistema';
      case 'FORNECEDOR':
        return 'Fornecedor Credenciado';
      default:
        return role;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Cabeçalho */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <User className="w-7 h-7 text-blue-600" /> Meu Perfil
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Gerencie suas informações pessoais e os dados de cadastro da sua conta no Síndico Expert.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card do Usuário */}
        <Card className="bg-white border-slate-200 text-slate-900 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">{profile.name}</CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-0.5">{profile.email}</CardDescription>
              </div>
            </div>

            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-3 py-1 font-semibold flex items-center gap-1.5 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              {getRoleLabel(profile.role)}
            </Badge>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {message && (
              <div
                className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : null}
                <span>{message.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Nome Completo
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-white border-slate-300 text-slate-900 focus:border-blue-500 text-sm"
                  required
                />
              </div>

              {/* Email (Leitura) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email de Acesso
                </label>
                <Input
                  value={profile.email}
                  disabled
                  className="bg-slate-100 border-slate-200 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" /> Telefone / WhatsApp
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 90000-0000"
                  className="bg-white border-slate-300 text-slate-900 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Documento CPF / CNPJ */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Documento (CPF ou CNPJ)
                </label>
                <Input
                  value={documentCnpjCpf}
                  onChange={(e) => setDocumentCnpjCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="bg-white border-slate-300 text-slate-900 focus:border-blue-500 text-sm font-mono"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </Card>

        {/* Card de Informações da Organização */}
        <Card className="bg-white border-slate-200 text-slate-900 shadow-md rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Organização Associada</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div>
              <span className="text-slate-500 block">Razão Social / Nome da Empresa</span>
              <strong className="text-slate-900 text-sm block mt-0.5">{profile.organizationName}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">Documento Registrado</span>
              <strong className="text-slate-900 text-sm font-mono block mt-0.5">
                {profile.organizationDocument || 'Não registrado'}
              </strong>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
