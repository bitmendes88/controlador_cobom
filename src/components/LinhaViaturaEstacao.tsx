
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
  // Simular dados de equipe (em uma implementação real, viriam do banco de dados)
  const obterEquipeViatura = (viaturaId: string) => {
    // Dados mock para demonstração
    const equipesDemo = {
      // Exemplo de dados que poderiam vir do banco
      'default': [
        {
          nome: 'João Silva',
          telefone: '(11) 99999-1111',
          cursos: ['Bombeiro Civil', 'Primeiros Socorros']
        },
        {
          nome: 'Maria Santos',
          telefone: '(11) 99999-2222',
          cursos: ['Paramédico', 'Resgate']
        }
      ]
    };
    
    // Retorna uma equipe demo ou array vazio
    return Math.random() > 0.5 ? equipesDemo.default : [];
  };

  return (
    <div className="flex items-start space-x-4 py-1">
      <div className="min-w-[180px] w-[180px] flex items-center">
        <h3 
          className="font-bold text-red-800 text-lg leading-tight break-words"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(255,255,255,0.8)',
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))'
          }}
        >
          {estacao.nome}
        </h3>
      </div>

      <div className="flex-1">
        {viaturas.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {viaturas.map((viatura) => (
              <ItemViatura
                key={viatura.id}
                vehicle={viatura}
                onVehicleClick={aoClicarViatura}
                onStatusUpdate={aoAtualizarStatus}
                vehicleObservation={observacoesViaturas[viatura.id]}
                integrantesEquipe={obterEquipeViatura(viatura.id)}
              />
            ))}
          </div>
        ) : (
          <div 
            className="text-gray-500 italic text-sm font-medium"
            style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
          >
            Nenhuma viatura atribuída
          </div>
        )}
      </div>
    </div>
  );
};
