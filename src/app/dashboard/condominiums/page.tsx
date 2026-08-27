import { listCondominiums } from '@/services/condominium.service';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { CreateCondominiumSheet } from '@/components/condominiums/CreateCondominiumSheet';
import Link from 'next/link';
import { Building2, ClipboardList } from 'lucide-react';

export default async function CondominiumsPage() {
  const condominiums = await listCondominiums();

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Meus Condomínios</h1>
          <p className="text-gray-500">Você tem {condominiums.length} condomínio(s) cadastrado(s)</p>
        </div>
        <div className="hidden md:block">
          <CreateCondominiumSheet />
        </div>
      </div>

      {condominiums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed">
          <Building2 className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium">Nenhum condomínio</h3>
          <p className="text-gray-500 text-center max-w-sm mb-4">
            Você ainda não possui condomínios cadastrados. Comece adicionando o seu primeiro.
          </p>
          <div className="md:hidden">
            {/* FAB is global but we can let them use it */}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {condominiums.map((condo: any) => {
            const hasSpec = !!condo.condo_technical_specs;
            return (
              <Card key={condo.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg leading-tight">
                      {condo.name}
                    </CardTitle>
                    <Badge variant={hasSpec ? 'default' : 'secondary'} className={hasSpec ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}>
                      {hasSpec ? 'Completa' : 'Pendente'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {condo.address}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  {/* Resumo ou info adicional no futuro */}
                </CardContent>
                <CardFooter className="gap-2 flex-col sm:flex-row">
                  <Link 
                    href={`/dashboard/condominiums/${condo.id}/tech-spec`}
                    className={buttonVariants({ variant: "outline", className: "w-full" })}
                  >
                    Ficha Técnica
                  </Link>
                  <Link 
                    href={`/dashboard/requests?condo=${condo.id}`}
                    className={buttonVariants({ variant: "secondary", className: "w-full" })}
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Solicitações
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* FAB para mobile (md:hidden já está tratado dentro do componente) */}
      <div className="md:hidden">
        <CreateCondominiumSheet />
      </div>
    </div>
  );
}
