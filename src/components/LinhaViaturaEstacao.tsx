
import { ItemViatura } from './ItemViatura';
import { Shield, Radio, Smartphone, Phone, User } from 'lucide-react';

interface Viatura {
  id: string;
  prefixo: string;
  status: string;
  qsa_radio?: number;
  qsa_zello?: number;
  dejem?: boolean;
  modalidade: {
    nome: string;
    icone_url: string;
    imagem_disponivel?: string;
    imagem_qti?: string;
    imagem_local?: string;
    imagem_qti_ps?: string;
    imagem_regresso?: string;
    imagem_baixado?: string;
    imagem_reserva?: string;
  };
}

interface Estacao {
  id: string;
  nome: string;
  endereco?: string;
  telegrafista?: string;
  qsa_radio?: number;
  qsa_zello?: number;
  telefone?: string;
  subgrupamento?: {
    id: string;
    nome: string;
  };
}

interface LinhaViaturaEstacaoProps {
  estacao: Estacao;
  viaturas: Viatura[];
  aoClicarViatura: (viatura: Viatura) => void;
  aoClicarEstacao: (estacao: Estacao) => void;
  aoAtualizarStatus: (viaturaId: string, status: string) => void;
  observacoesViaturas: Record<string, string>;
}

export const LinhaViaturaEstacao = ({ 
  estacao, 
  viaturas, 
  aoClicarViatura, 
  aoClicarEstacao,
  aoAtualizarStatus, 
  observacoesViaturas 
}: LinhaViaturaEstacaoProps) => {
  // Simular dados de equipe (em uma implementação real, viriam do banco de dados)
  const obterEquipeViatura = (viaturaId: string) => {
    const equipesDemo = {
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
    
    return Math.random() > 0.5 ? equipesDemo.default : [];
  };

  const getQsaColor = (qsa?: number) => {
    if (!qsa && qsa !== 0) return 'bg-gray-100 text-gray-600';
    switch (qsa) {
      case 0: return 'bg-red-500 text-white';
      case 1: return 'bg-red-400 text-white';
      case 2: return 'bg-orange-400 text-white';
      case 3: return 'bg-yellow-400 text-white';
      case 4: return 'bg-lime-400 text-white';
      case 5: return 'bg-green-500 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex items-center space-x-3 py-0">
      <div className="min-w-[180px] w-[180px] flex items-center justify-start">
        <div className="relative text-left p-1 rounded-lg min-h-[30px] flex flex-col justify-center w-full">
          <Shield 
            className="absolute right-1 top-1 w-4 h-4 text-gray-300 opacity-20"
            style={{ zIndex: 0 }}
          />
          
          <h3 
            className="relative font-bold text-red-800 text-base leading-tight break-words text-left z-10 cursor-pointer hover:underline"
            style={{
              textShadow: '2px 2px 4px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.7), 0 0 6px rgba(255,255,255,0.8)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
            onClick={() => aoClicarEstacao(estacao)}
          >
            {estacao.nome}
          </h3>
          
          {/* Informações da estação alinhadas à esquerda com fonte menor */}
          <div className="flex flex-col gap-0 mt-0.5 relative z-10 text-sm text-gray-700">
            {estacao.telegrafista && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{estacao.telegrafista}</span>
              </div>
            )}
            {estacao.telefone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{estacao.telefone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {(estacao.qsa_radio || estacao.qsa_radio === 0) && (
                <div className={`flex items-center gap-1 text-xs px-1 py-0.5 rounded ${getQsaColor(estacao.qsa_radio)}`}>
                  <Radio className="w-2.5 h-2.5" />
                  <span className="font-medium">R:{estacao.qsa_radio}</span>
                </div>
              )}
              {(estacao.qsa_zello || estacao.qsa_zello === 0) && (
                <div className={`flex items-center gap-1 text-xs px-1 py-0.5 rounded ${getQsaColor(estacao.qsa_zello)}`}>
                  <Smartphone className="w-2.5 h-2.5" />
                  <span className="font-medium">Z:{estacao.qsa_zello}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {viaturas.length > 0 ? (
          <div className="flex flex-wrap gap-1 sm:gap-2 w-full">
            {viaturas.map((viatura) => (
              <div 
                key={viatura.id} 
                className="flex-shrink-0"
                style={{
                  minWidth: 'clamp(120px, 15vw, 200px)',
                  maxWidth: 'clamp(160px, 20vw, 240px)'
                }}
              >
                <ItemViatura
                  vehicle={viatura}
                  onVehicleClick={aoClicarViatura}
                  onStatusUpdate={aoAtualizarStatus}
                  vehicleObservation={observacoesViaturas[viatura.id]}
                  integrantesEquipe={obterEquipeViatura(viatura.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="text-gray-500 italic text-sm font-medium flex items-center px-4 py-2 rounded-lg bg-gray-50/50"
            style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
          >
            🚒 Nenhuma viatura atribuída a esta estação
          </div>
        )}
      </div>
    </div>
  );
};
