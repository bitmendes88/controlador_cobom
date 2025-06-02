
import { ItemViatura } from './ItemViatura';

interface Viatura {
  id: string;
  prefixo: string;
  status: string;
  modalidade: {
    nome: string;
    icone_url: string;
  };
}

interface Estacao {
  id: string;
  nome: string;
}

interface LinhaViaturaEstacaoProps {
  estacao: Estacao;
  viaturas: Viatura[];
  aoClicarViatura: (viatura: Viatura) => void;
  aoAtualizarStatus: (viaturaId: string, status: string) => void;
  observacoesViaturas: Record<string, string>;
}

export const LinhaViaturaEstacao = ({ 
  estacao, 
  viaturas, 
  aoClicarViatura, 
  aoAtualizarStatus, 
  observacoesViaturas 
}: LinhaViaturaEstacaoProps) => {
  return (
    <div className="flex items-start space-x-4">
      <div className="min-w-[180px] pt-2">
        <h3 className="font-semibold text-red-800 text-base leading-tight">
          {estacao.nome}
        </h3>
      </div>

      <div className="flex-1">
        {viaturas.length > 0 ? (
          <div className="grid grid-cols-auto-fit gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
            {viaturas.map((viatura) => (
              <ItemViatura
                key={viatura.id}
                vehicle={viatura}
                onVehicleClick={aoClicarViatura}
                onStatusUpdate={aoAtualizarStatus}
                vehicleObservation={observacoesViaturas[viatura.id]}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic pt-2 text-sm">
            Nenhuma viatura atribuída
          </div>
        )}
      </div>
    </div>
  );
};
