
import { ItemViatura } from './ItemViatura';
import { Shield, Radio, Smartphone } from 'lucide-react';

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

  const formatarInformacoesEstacao = () => {
    const infos = [];
    if (estacao.endereco) infos.push(estacao.endereco);
    if (estacao.telegrafista) infos.push(`Tel: ${estacao.telegrafista}`);
    if (estacao.telefone) infos.push(estacao.telefone);
    return infos.join(' | ');
  };

  return (
    <div className="flex items-center space-x-3 py-0.5">
      <div className="min-w-[180px] w-[180px] flex items-center justify-start">
        <div 
          className="relative text-left p-2 rounded-lg min-h-[45px] flex flex-col justify-center w-full cursor-pointer hover:bg-opacity-70 transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(147,51,234,0.05) 50%, rgba(239,68,68,0.05) 100%)',
          }}
          onClick={() => aoClicarEstacao(estacao)}
        >
          <Shield 
            className="absolute right-2 top-2 w-5 h-5 text-gray-300 opacity-20"
            style={{ zIndex: 0 }}
          />
          
          <h3 
            className="relative font-bold text-red-800 text-lg leading-tight break-words text-left z-10"
            style={{
              textShadow: '2px 2px 4px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.7), 0 0 6px rgba(255,255,255,0.8)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
          >
            {estacao.nome}
          </h3>
          
          {/* Informações adicionais da estação */}
          {formatarInformacoesEstacao() && (
            <p className="text-xs text-gray-600 mt-1 relative z-10">
              {formatarInformacoesEstacao()}
            </p>
          )}
          
          {/* QSA da estação */}
          <div className="flex items-center gap-2 mt-1 relative z-10">
            {estacao.qsa_radio && (
              <div className="flex items-center gap-1 text-xs text-gray-700">
                <Radio className="w-3 h-3" />
                <span>{estacao.qsa_radio}</span>
              </div>
            )}
            {estacao.qsa_zello && (
              <div className="flex items-center gap-1 text-xs text-gray-700">
                <Smartphone className="w-3 h-3" />
                <span>{estacao.qsa_zello}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1">
        {viaturas.length > 0 ? (
          <div className="flex flex-wrap gap-1">
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
            className="text-gray-500 italic text-sm font-medium flex items-center"
            style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
          >
            Nenhuma viatura atribuída
          </div>
        )}
      </div>
    </div>
  );
};
